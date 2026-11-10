using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Earnings;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class EarningsService : IEarningsService
{
    private readonly ApplicationDbContext _db;

    public EarningsService(ApplicationDbContext db)
    {
        _db = db;
    }

    private sealed class EarningRow
    {
        public decimal FinalWeight { get; init; }

        public decimal TotalAmount { get; init; }

        public DateTime CollectedAt { get; init; }
    }

    private sealed class AdminEarningRow
    {
        public Guid FarmerId { get; init; }

        public Guid? CollectorId { get; init; }

        public string? CollectorName { get; init; }

        public decimal FinalWeight { get; init; }

        public decimal TotalAmount { get; init; }

        public DateTime CollectedAt { get; init; }
    }

    private static DateTime StartUtc(DateOnly date)
    {
        return new DateTime(
            date.Year,
            date.Month,
            date.Day,
            0, 0, 0,
            DateTimeKind.Utc);
    }

    private static DateTime EndExclusiveUtc(DateOnly date)
    {
        return StartUtc(date.AddDays(1));
    }

    private static IQueryable<Collection> VerifiedCollections(
        ApplicationDbContext db)
    {
        return db.Collections
            .AsNoTracking()
            .Where(x =>
                x.Status == CollectionStatus.Collected ||
                x.Status == CollectionStatus.Synced);
    }

    private async Task<Guid> GetFarmerIdAsync(
        Guid farmerUserId,
        CancellationToken ct)
    {
        var farmerId = await _db.Farmers
            .Where(x => x.UserId == farmerUserId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);

        return farmerId
            ?? throw new UnauthorizedAccessException(
                "Farmer profile not found.");
    }

    private async Task<Guid> GetCollectorIdAsync(
        Guid collectorUserId,
        CancellationToken ct)
    {
        var collectorId = await _db.Collectors
            .Where(x => x.UserId == collectorUserId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);

        return collectorId
            ?? throw new UnauthorizedAccessException(
                "Collector profile not found.");
    }

    private static EarningsSummaryDto BuildSummary(
        DateTime from,
        DateTime to,
        IReadOnlyCollection<EarningRow> rows)
    {
        var daily = rows
            .GroupBy(x => x.CollectedAt.Date)
            .OrderBy(x => x.Key)
            .Select(g => new DailyEarningDto
            {
                Date = g.Key,
                CollectionCount = g.Count(),
                TotalWeightKg = g.Sum(x => x.FinalWeight),
                TotalEarnings = g.Sum(x => x.TotalAmount)
            })
            .ToList();

        var totalWeight = rows.Sum(x => x.FinalWeight);
        var totalAmount = rows.Sum(x => x.TotalAmount);

        return new EarningsSummaryDto
        {
            From = from,
            To = to,
            CollectionCount = rows.Count,
            TotalWeightKg = totalWeight,
            TotalEarnings = totalAmount,
            AveragePricePerKg = totalWeight == 0
                ? 0
                : decimal.Round(
                    totalAmount / totalWeight,
                    2,
                    MidpointRounding.AwayFromZero),
            DailyBreakdown = daily
        };
    }

    private static IQueryable<EarningRow> FarmerEarningRows(
        IQueryable<Collection> query)
    {
        return query.Select(x => new EarningRow
        {
            FinalWeight = x.FinalWeight,
            TotalAmount = x.TotalAmount,
            CollectedAt = x.CollectedAt
        });
    }

    public async Task<EarningsSummaryDto> GetDailyEarningsAsync(
        Guid farmerUserId,
        DateOnly date,
        CancellationToken ct)
    {
        var farmerId = await GetFarmerIdAsync(farmerUserId, ct);

        var from = StartUtc(date);
        var to = EndExclusiveUtc(date);

        var rows = await FarmerEarningRows(
                VerifiedCollections(_db).Where(x =>
                    x.FarmerId == farmerId &&
                    x.CollectedAt >= from &&
                    x.CollectedAt < to))
            .ToListAsync(ct);

        return BuildSummary(from, to.AddTicks(-1), rows);
    }

    public async Task<EarningsSummaryDto> GetMonthlyEarningsAsync(
        Guid farmerUserId,
        int year,
        int month,
        CancellationToken ct)
    {
        if (year < 2020 || year > 2100)
            throw new ArgumentOutOfRangeException(
                nameof(year), "Year must be between 2020 and 2100.");

        if (month < 1 || month > 12)
            throw new ArgumentOutOfRangeException(
                nameof(month), "Month must be between 1 and 12.");

        var farmerId = await GetFarmerIdAsync(farmerUserId, ct);

        var from = new DateTime(
            year, month, 1, 0, 0, 0, DateTimeKind.Utc);

        var to = from.AddMonths(1);

        var rows = await FarmerEarningRows(
                VerifiedCollections(_db).Where(x =>
                    x.FarmerId == farmerId &&
                    x.CollectedAt >= from &&
                    x.CollectedAt < to))
            .ToListAsync(ct);

        return BuildSummary(from, to.AddTicks(-1), rows);
    }

    public async Task<IReadOnlyList<CollectionEarningDto>>
        GetCollectionEarningsAsync(
            Guid farmerUserId,
            DateOnly? from,
            DateOnly? to,
            CancellationToken ct)
    {
        ValidateRange(from, to);

        var farmerId = await GetFarmerIdAsync(farmerUserId, ct);

        var query = VerifiedCollections(_db)
            .Where(x => x.FarmerId == farmerId);

        if (from.HasValue)
        {
            var start = StartUtc(from.Value);
            query = query.Where(x => x.CollectedAt >= start);
        }

        if (to.HasValue)
        {
            var end = EndExclusiveUtc(to.Value);
            query = query.Where(x => x.CollectedAt < end);
        }

        return await query
            .OrderByDescending(x => x.CollectedAt)
            .Select(x => new CollectionEarningDto
            {
                CollectionId = x.Id,
                CollectedAt = x.CollectedAt,
                FinalWeightKg = x.FinalWeight,
                PricePerKg = x.PricePerKg,
                Amount = x.TotalAmount,
                Status = x.Status.ToString()
            })
            .ToListAsync(ct);
    }

    public async Task<EarningsSummaryDto> GetCollectorEarningsAsync(
        Guid collectorUserId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        ValidateRange(from, to);

        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        var query = VerifiedCollections(_db)
            .Where(x => x.CollectorId == collectorId);

        if (from.HasValue)
        {
            var start = StartUtc(from.Value);
            query = query.Where(x => x.CollectedAt >= start);
        }

        if (to.HasValue)
        {
            var end = EndExclusiveUtc(to.Value);
            query = query.Where(x => x.CollectedAt < end);
        }

        var rows = await FarmerEarningRows(query).ToListAsync(ct);

        var rangeFrom = from.HasValue
            ? StartUtc(from.Value)
            : rows.Count > 0
                ? rows.Min(x => x.CollectedAt).Date
                : DateTime.UtcNow.Date;

        var rangeTo = to.HasValue
            ? EndExclusiveUtc(to.Value).AddTicks(-1)
            : DateTime.UtcNow;

        return BuildSummary(rangeFrom, rangeTo, rows);
    }

    public async Task<AdminEarningsSummaryDto> GetAdminEarningsAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct)
    {
        if (from > to)
            throw new ArgumentException(
                "From date cannot be after To date.");

        var start = StartUtc(from);
        var end = EndExclusiveUtc(to);

        // Collector identity is read from the collection's farmer
        // assignment, matching the current TeaLedger relationships.
        var rows = await VerifiedCollections(_db)
            .Where(x =>
                x.CollectedAt >= start &&
                x.CollectedAt < end)
            .Select(x => new AdminEarningRow
            {
                FarmerId = x.FarmerId,
                CollectorId = x.CollectorId,
                CollectorName = x.Farmer.Collector == null
                    ? null
                    : x.Farmer.Collector.User.FullName,
                FinalWeight = x.FinalWeight,
                TotalAmount = x.TotalAmount,
                CollectedAt = x.CollectedAt
            })
            .ToListAsync(ct);

        var daily = rows
            .GroupBy(x => x.CollectedAt.Date)
            .OrderBy(x => x.Key)
            .Select(g => new DailyEarningDto
            {
                Date = g.Key,
                CollectionCount = g.Count(),
                TotalWeightKg = g.Sum(x => x.FinalWeight),
                TotalEarnings = g.Sum(x => x.TotalAmount)
            })
            .ToList();

        var collectors = rows
            .Where(x => x.CollectorId.HasValue)
            .GroupBy(x => new
            {
                CollectorId = x.CollectorId!.Value,
                CollectorName = x.CollectorName ?? "Unknown collector"
            })
            .Select(g => new CollectorEarningsDto
            {
                CollectorId = g.Key.CollectorId,
                CollectorName = g.Key.CollectorName,
                CollectionCount = g.Count(),
                TotalWeightKg = g.Sum(x => x.FinalWeight),
                TotalEarnings = g.Sum(x => x.TotalAmount)
            })
            .OrderByDescending(x => x.TotalEarnings)
            .ToList();

        return new AdminEarningsSummaryDto
        {
            From = start,
            To = end.AddTicks(-1),
            CollectionCount = rows.Count,
            FarmerCount = rows
                .Select(x => x.FarmerId)
                .Distinct()
                .Count(),
            CollectorCount = collectors.Count,
            TotalWeightKg = rows.Sum(x => x.FinalWeight),
            TotalEarnings = rows.Sum(x => x.TotalAmount),
            DailyBreakdown = daily,
            CollectorBreakdown = collectors
        };
    }

    public async Task<IReadOnlyList<FinancialLedgerEntryDto>>
        GetFarmerLedgerAsync(
            Guid farmerUserId,
            DateOnly? from,
            DateOnly? to,
            CancellationToken ct)
    {
        ValidateRange(from, to);

        var farmerId = await GetFarmerIdAsync(farmerUserId, ct);

        var query = _db.FinancialLedgerEntries
            .AsNoTracking()
            .Where(x => x.FarmerId == farmerId);

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

        return await query
            .OrderByDescending(x => x.OccurredAt)
            .Select(x => new FinancialLedgerEntryDto
            {
                Id = x.Id,
        
                CollectionId = x.CollectionId,
        
                DeductionId = x.DeductionId,
        
                LoanRepaymentId = x.LoanRepaymentId,
        
                TransactionType = x.TransactionType,
        
                Direction = x.Direction,
        
                Amount = x.Amount,
        
                Description = x.Description,
        
                Reference = x.Reference,
        
                OccurredAt = x.OccurredAt
            })
            .ToListAsync(ct);
            }

    public async Task<EarningsReconciliationDto> ReconcileAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct)
    {
        if (from > to)
            throw new ArgumentException(
                "From date cannot be after To date.");

        var start = StartUtc(from);
        var end = EndExclusiveUtc(to);

        var collections = VerifiedCollections(_db)
            .Where(x =>
                x.CollectedAt >= start &&
                x.CollectedAt < end);

        var collectionTotal = await collections
            .SumAsync(x => (decimal?)x.TotalAmount, ct) ?? 0m;

        // Only count ledger credits that belong to verified
        // collections in this requested date range.
        var ledgerCreditTotal = await _db.FinancialLedgerEntries
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.CollectionEarning &&
                x.Direction == FinancialDirection.Credit &&
                x.CollectionId != null &&
                x.OccurredAt >= start &&
                x.OccurredAt < end &&
                collections.Any(c => c.Id == x.CollectionId))
            .SumAsync(x => (decimal?)x.Amount, ct) ?? 0m;

        var missingCount = await collections
            .CountAsync(c =>
                !_db.FinancialLedgerEntries.Any(l =>
                    l.CollectionId == c.Id &&
                    l.TransactionType ==
                        FinancialTransactionType.CollectionEarning &&
                    l.Direction == FinancialDirection.Credit), ct);

        var difference = collectionTotal - ledgerCreditTotal;

        return new EarningsReconciliationDto
        {
            From = start,
            To = end.AddTicks(-1),
            CollectionTotal = collectionTotal,
            LedgerCreditTotal = ledgerCreditTotal,
            Difference = difference,
            CollectionsWithoutLedgerEntry = missingCount,
            IsBalanced = difference == 0m && missingCount == 0
        };
    }

    private static void ValidateRange(
        DateOnly? from,
        DateOnly? to)
    {
        if (from.HasValue &&
            to.HasValue &&
            from.Value > to.Value)
        {
            throw new ArgumentException(
                "From date cannot be after To date.");
        }
    }
}
