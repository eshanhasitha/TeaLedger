using System.Data;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Deductions;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class DeductionService : IDeductionService
{
    private readonly ApplicationDbContext _db;

    public DeductionService(ApplicationDbContext db)
    {
        _db = db;
    }

    public static decimal CalculateAmount(
        decimal quantity,
        decimal unitPrice)
    {
        if (quantity <= 0)
            throw new ArgumentException(
                "Quantity must be greater than zero.");

        if (unitPrice <= 0)
            throw new ArgumentException(
                "Unit price must be greater than zero.");

        var amount = decimal.Round(
            quantity * unitPrice,
            2,
            MidpointRounding.AwayFromZero);

        if (amount <= 0)
            throw new ArgumentException(
                "Calculated deduction must be greater than zero.");

        return amount;
    }

    private static void ValidateMoneyPrecision(decimal value)
    {
        if (decimal.Round(
                value,
                2,
                MidpointRounding.AwayFromZero) != value)
        {
            throw new ArgumentException(
                "Money values can have at most two decimal places.");
        }
    }

    private static DateTime StartUtc(DateOnly date) =>
        new(date.Year, date.Month, date.Day, 0, 0, 0,
            DateTimeKind.Utc);

    private static DateTime EndExclusiveUtc(DateOnly date) =>
        StartUtc(date.AddDays(1));

    private static void ValidateRange(
        DateOnly? from,
        DateOnly? to)
    {
        if (from.HasValue && to.HasValue && from > to)
            throw new ArgumentException(
                "From date cannot be after To date.");
    }

    private async Task<Guid> GetCollectorIdAsync(
        Guid collectorUserId,
        CancellationToken ct)
    {
        var id = await _db.Collectors
            .Where(x => x.UserId == collectorUserId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);

        return id ?? throw new UnauthorizedAccessException(
            "Collector profile not found.");
    }

    private static IQueryable<Deduction> BaseQuery(
        ApplicationDbContext db)
    {
        return db.Deductions
            .AsNoTracking()
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User);
    }

    private static IQueryable<Deduction> ApplyFilters(
        IQueryable<Deduction> query,
        DeductionCategory? category,
        DateOnly? from,
        DateOnly? to)
    {
        if (category.HasValue)
            query = query.Where(x => x.Category == category.Value);

        if (from.HasValue)
        {
            var start = StartUtc(from.Value);
            query = query.Where(x => x.OccurredAt >= start);
        }

        if (to.HasValue)
        {
            var end = EndExclusiveUtc(to.Value);
            query = query.Where(x => x.OccurredAt < end);
        }

        return query;
    }

    private static DeductionDto Map(Deduction x) => new()
    {
        Id = x.Id,
        FarmerId = x.FarmerId,
        FarmerName = x.Farmer.User.FullName,
        FarmerCode = x.Farmer.FarmerCode,
        CollectorId = x.CollectorId,
        Category = x.Category,
        Description = x.Description,
        Quantity = x.Quantity,
        Unit = x.Unit,
        UnitPrice = x.UnitPrice,
        Amount = x.Amount,
        OccurredAt = x.OccurredAt,
        Notes = x.Notes,
        CreatedAt = x.CreatedAt
    };

    public async Task<DeductionDto> CreateAsync(
        Guid collectorUserId,
        Guid farmerId,
        CreateDeductionDto input,
        CancellationToken ct)
    {
        if (!Enum.IsDefined(input.Category))
            throw new ArgumentException(
                "Invalid deduction category.");

        if (string.IsNullOrWhiteSpace(input.Description))
            throw new ArgumentException(
                "Description is required.");

        if (string.IsNullOrWhiteSpace(input.Unit))
            throw new ArgumentException(
                "Unit is required.");

        if (input.Quantity <= 0 || input.UnitPrice <= 0)
            throw new ArgumentException(
                "Quantity and unit price must be greater than zero.");

        ValidateMoneyPrecision(input.UnitPrice);

        var amount = CalculateAmount(
            input.Quantity,
            input.UnitPrice);

        var now = DateTime.UtcNow;
        var occurredAt =
            input.OccurredAt?.ToUniversalTime() ?? now;

        if (occurredAt > now.AddMinutes(5))
            throw new ArgumentException(
                "Deduction date cannot be in the future.");

        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable, ct);

        var farmer = await _db.Farmers
            .Include(x => x.User)
            .SingleOrDefaultAsync(
                x => x.Id == farmerId &&
                     x.CollectorId == collectorId,
                ct);

        if (farmer is null)
            throw new InvalidOperationException(
                "Farmer is not assigned to this collector.");

        if (!farmer.IsActive || !farmer.User.IsActive)
            throw new InvalidOperationException(
                "Cannot record a deduction for an inactive farmer.");

        var deduction = new Deduction
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            CollectorId = collectorId,
            Category = input.Category,
            Description = input.Description.Trim(),
            Quantity = input.Quantity,
            Unit = input.Unit.Trim(),
            UnitPrice = input.UnitPrice,
            Amount = amount,
            OccurredAt = occurredAt,
            CreatedByUserId = collectorUserId,
            Notes = string.IsNullOrWhiteSpace(input.Notes)
                ? null
                : input.Notes.Trim(),
            CreatedAt = now
        };

        var ledgerEntry = new FinancialLedgerEntry
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            CollectionId = null,
            DeductionId = deduction.Id,
            TransactionType = FinancialTransactionType.Deduction,
            Direction = FinancialDirection.Debit,
            Amount = amount,
            Description = $"Deduction: {input.Category} - {input.Description.Trim()}",
            Reference = deduction.Id.ToString(),
            OccurredAt = occurredAt,
            CreatedAt = now
        };

        var audit = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = collectorUserId,
            Action = "DeductionCreated",
            EntityType = "Deduction",
            EntityId = deduction.Id,
            Details =
                $"FarmerId={farmer.Id}; " +
                $"CollectorId={collectorId}; " +
                $"Category={input.Category}; " +
                $"Quantity={input.Quantity} {input.Unit}; " +
                $"Amount={amount}",
            OccurredAt = now
        };

        _db.Deductions.Add(deduction);
        _db.FinancialLedgerEntries.Add(ledgerEntry);
        _db.ActivityLogs.Add(audit);

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        deduction.Farmer = farmer;

        return Map(deduction);
    }

    public async Task<IReadOnlyList<DeductionDto>> GetCollectorAsync(
        Guid collectorUserId,
        Guid? farmerId,
        DeductionCategory? category,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        ValidateRange(from, to);

        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        var query = BaseQuery(_db)
            .Where(x => x.CollectorId == collectorId);

        if (farmerId.HasValue)
            query = query.Where(x => x.FarmerId == farmerId.Value);

        var rows = await ApplyFilters(
                query, category, from, to)
            .OrderByDescending(x => x.OccurredAt)
            .ToListAsync(ct);

        return rows.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<DeductionDto>> GetFarmerAsync(
        Guid farmerUserId,
        DeductionCategory? category,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        ValidateRange(from, to);

        var query = BaseQuery(_db)
            .Where(x => x.Farmer.UserId == farmerUserId);

        var rows = await ApplyFilters(
                query, category, from, to)
            .OrderByDescending(x => x.OccurredAt)
            .ToListAsync(ct);

        return rows.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<DeductionDto>> GetAdminAsync(
        Guid? farmerId,
        Guid? collectorId,
        DeductionCategory? category,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        ValidateRange(from, to);

        var query = BaseQuery(_db);

        if (farmerId.HasValue)
            query = query.Where(x => x.FarmerId == farmerId.Value);

        if (collectorId.HasValue)
            query = query.Where(x => x.CollectorId == collectorId.Value);

        var rows = await ApplyFilters(
                query, category, from, to)
            .OrderByDescending(x => x.OccurredAt)
            .ToListAsync(ct);

        return rows.Select(Map).ToList();
    }

    public async Task<DeductionSummaryDto> GetAdminSummaryAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct)
    {
        if (from > to)
            throw new ArgumentException(
                "From date cannot be after To date.");

        var start = StartUtc(from);
        var end = EndExclusiveUtc(to);

        var rows = await _db.Deductions
            .AsNoTracking()
            .Where(x =>
                x.OccurredAt >= start &&
                x.OccurredAt < end)
            .GroupBy(x => x.Category)
            .Select(g => new DeductionCategorySummaryDto
            {
                Category = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(x => x.Amount)
            })
            .ToListAsync(ct);

        return new DeductionSummaryDto
        {
            From = start,
            To = end.AddTicks(-1),
            DeductionCount = rows.Sum(x => x.Count),
            TotalAmount = rows.Sum(x => x.TotalAmount),
            Categories = rows.OrderBy(x => x.Category).ToList()
        };
    }
}