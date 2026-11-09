using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.TeaPrices;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class TeaPriceService : ITeaPriceService
{
    private readonly ApplicationDbContext _db;
    private readonly IActivityLogService _activityLog;

    public TeaPriceService(
        ApplicationDbContext db,
        IActivityLogService activityLog)
    {
        _db = db;
        _activityLog = activityLog;
    }

    public async Task<TeaPriceDto> SetMonthlyPriceForCollectorUserAsync(
        Guid collectorUserId,
        SetMonthlyTeaPriceDto input,
        CancellationToken ct)
    {
        var collector = await _db.Collectors
            .SingleOrDefaultAsync(
                x => x.UserId == collectorUserId,
                ct);

        if (collector is null)
            throw new UnauthorizedAccessException(
                "Collector profile not found.");

        return await SaveMonthlyPriceAsync(
            collector.Id,
            collectorUserId,
            input,
            ct);
    }

    public async Task<TeaPriceDto> SetMonthlyPriceForAdminAsync(
        Guid adminUserId,
        Guid collectorId,
        SetMonthlyTeaPriceDto input,
        CancellationToken ct)
    {
        var collectorExists = await _db.Collectors
            .AnyAsync(x => x.Id == collectorId, ct);

        if (!collectorExists)
            throw new KeyNotFoundException(
                "Collector not found.");

        return await SaveMonthlyPriceAsync(
            collectorId,
            adminUserId,
            input,
            ct);
    }

    private async Task<TeaPriceDto> SaveMonthlyPriceAsync(
        Guid collectorId,
        Guid actorUserId,
        SetMonthlyTeaPriceDto input,
        CancellationToken ct)
    {
        ValidateInput(input);

        var effectiveFrom = NormalizeUtc(input.EffectiveFrom);

        var monthStart = new DateTime(
            input.Year,
            input.Month,
            1,
            0, 0, 0,
            DateTimeKind.Utc);

        var monthEnd = monthStart.AddMonths(1);

        if (effectiveFrom < monthStart ||
            effectiveFrom >= monthEnd)
        {
            throw new ArgumentException(
                "EffectiveFrom must fall within the selected month.");
        }

        var existing = await _db.TeaPrices
            .SingleOrDefaultAsync(
                x => x.CollectorId == collectorId &&
                    x.Year == input.Year &&
                    x.Month == input.Month,
                ct);

        var isNew = existing is null;
        var now = DateTime.UtcNow;


        decimal? oldPrice = existing?.PricePerKg;
        DateTime? oldEffectiveFrom = existing?.EffectiveFrom;

        if (isNew)
        {
            existing = new TeaPrice
            {
                Id = Guid.NewGuid(),
                CollectorId = collectorId,
                Year = input.Year,
                Month = input.Month,
                CreatedByUserId = actorUserId,
                CreatedAt = now
            };

            _db.TeaPrices.Add(existing);
        }

        existing!.PricePerKg = input.PricePerKg;
        existing.EffectiveFrom = effectiveFrom;
        existing.UpdatedAt = now;

        // Save price and audit event in the same database transaction.
        await using var transaction =
            await _db.Database.BeginTransactionAsync(ct);

        await _db.SaveChangesAsync(ct);

        var details = JsonSerializer.Serialize(new
        {
            CollectorId = collectorId,
            input.Year,
            input.Month,
            OldPricePerKg = oldPrice,
            NewPricePerKg = input.PricePerKg,
            OldEffectiveFrom = oldEffectiveFrom,
            NewEffectiveFrom = effectiveFrom
        });

        await _activityLog.RecordAsync(
            actorUserId,
            isNew ? "TeaPriceCreated" : "TeaPriceUpdated",
            nameof(TeaPrice),
            existing.Id,
            details,
            ct);

        await transaction.CommitAsync(ct);

        return Map(existing);
    }

    public async Task<TeaPriceDto?> GetEffectivePriceForUserAsync(
        Guid userId,
        DateTime date,
        CancellationToken ct)
    {
        var user = await _db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == userId, ct);

        if (user is null)
            throw new UnauthorizedAccessException(
                "User not found.");

        Guid collectorId;

        if (user.Role == UserRole.Collector)
        {
            var collector = await _db.Collectors
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserId == userId, ct);

            if (collector is null)
                throw new UnauthorizedAccessException(
                    "Collector profile not found.");

            collectorId = collector.Id;
        }
        else if (user.Role == UserRole.Farmer)
        {
            var farmer = await _db.Farmers
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserId == userId, ct);

            if (farmer?.CollectorId is null)
                return null;

            collectorId = farmer.CollectorId.Value;
        }
        else
        {
            throw new UnauthorizedAccessException(
                "This endpoint is available to farmers and collectors.");
        }

        var requestedDate = NormalizeUtc(date);
        var priceYear = requestedDate.Year;
        var priceMonth = requestedDate.Month;

        var price = await _db.TeaPrices
            .AsNoTracking()
            .Where(x =>
                x.CollectorId == collectorId &&
                x.Year == priceYear &&
                x.Month == priceMonth &&
                x.EffectiveFrom <= requestedDate)
            .OrderByDescending(x => x.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        return price is null ? null : Map(price);
    }

    public async Task<IReadOnlyList<TeaPriceDto>>
        GetPriceHistoryForUserAsync(
            Guid userId,
            CancellationToken ct)
    {
        var user = await _db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == userId, ct);

        if (user is null)
            throw new UnauthorizedAccessException(
                "User not found.");

        Guid collectorId;

        if (user.Role == UserRole.Collector)
        {
            var collector = await _db.Collectors
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserId == userId, ct);

            if (collector is null)
                throw new UnauthorizedAccessException(
                    "Collector profile not found.");

            collectorId = collector.Id;
        }
        else if (user.Role == UserRole.Farmer)
        {
            var farmer = await _db.Farmers
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserId == userId, ct);

            if (farmer?.CollectorId is null)
                return Array.Empty<TeaPriceDto>();

            collectorId = farmer.CollectorId.Value;
        }
        else
        {
            throw new UnauthorizedAccessException(
                "This endpoint is available to farmers and collectors.");
        }

        return await _db.TeaPrices
            .AsNoTracking()
            .Where(x => x.CollectorId == collectorId)
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .Select(x => new TeaPriceDto
            {
                Id = x.Id,
                CollectorId = x.CollectorId,
                Year = x.Year,
                Month = x.Month,
                PricePerKg = x.PricePerKg,
                EffectiveFrom = x.EffectiveFrom,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<TeaPriceDto>>
        GetAdminPriceHistoryAsync(
            Guid collectorId,
            CancellationToken ct)
    {
        var collectorExists = await _db.Collectors
            .AnyAsync(x => x.Id == collectorId, ct);

        if (!collectorExists)
            throw new KeyNotFoundException(
                "Collector not found.");

        return await _db.TeaPrices
            .AsNoTracking()
            .Where(x => x.CollectorId == collectorId)
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .Select(x => new TeaPriceDto
            {
                Id = x.Id,
                CollectorId = x.CollectorId,
                Year = x.Year,
                Month = x.Month,
                PricePerKg = x.PricePerKg,
                EffectiveFrom = x.EffectiveFrom,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(ct);
    }

    public static decimal CalculateAmount(
        decimal finalWeight,
        decimal pricePerKg)
    {
        if (finalWeight <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(finalWeight),
                "Final weight must be greater than zero.");

        if (pricePerKg <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(pricePerKg),
                "Price per kg must be greater than zero.");

        return decimal.Round(
            finalWeight * pricePerKg,
            2,
            MidpointRounding.AwayFromZero);
    }

    private static void ValidateInput(
        SetMonthlyTeaPriceDto input)
    {
        if (input.Year < 2020 || input.Year > 2100)
            throw new ArgumentException("Invalid year.");

        if (input.Month < 1 || input.Month > 12)
            throw new ArgumentException("Invalid month.");

        if (input.PricePerKg <= 0 ||
            input.PricePerKg > 1_000_000)
        {
            throw new ArgumentException(
                "Price per kg must be greater than zero and within the allowed limit.");
        }

        if (input.EffectiveFrom == default)
            throw new ArgumentException(
                "EffectiveFrom is required.");
    }

    private static DateTime NormalizeUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(
                value,
                DateTimeKind.Utc)
        };
    }

    private static TeaPriceDto Map(TeaPrice x)
    {
        return new TeaPriceDto
        {
            Id = x.Id,
            CollectorId = x.CollectorId,
            Year = x.Year,
            Month = x.Month,
            PricePerKg = x.PricePerKg,
            EffectiveFrom = x.EffectiveFrom,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };
    }
}
