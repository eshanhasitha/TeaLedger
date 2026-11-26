
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed record DashboardSummaryDto
{
    public DateTime GeneratedAtUtc { get; init; }
    public DateTime FromUtc { get; init; }
    public DateTime ToUtc { get; init; }

    public int FarmerCount { get; init; }
    public int CollectorCount { get; init; }

    public int CollectionCount { get; init; }
    public int PendingCollectionCount { get; init; }
    public int CollectedCollectionCount { get; init; }
    public int CancelledCollectionCount { get; init; }

    public decimal TotalGrossWeightKg { get; init; }
    public decimal TotalFinalWeightKg { get; init; }

    public decimal CollectionEarnings { get; init; }
    public decimal MaterialDeductions { get; init; }
    public decimal LoanRepayments { get; init; }
    public decimal LoanDisbursements { get; init; }

    public decimal OutstandingLoanBalance { get; init; }

    public int SettlementCount { get; init; }
    public int PaidSettlementCount { get; init; }
    public int DraftSettlementCount { get; init; }
    public decimal SettlementAmount { get; init; }
}

public sealed record DailyCollectionMetricDto
{
    public DateOnly Date { get; init; }
    public int CollectionCount { get; init; }
    public decimal FinalWeightKg { get; init; }
    public decimal Earnings { get; init; }
}

public sealed record DashboardResponseDto
{
    public DashboardSummaryDto Summary { get; init; } = new();
    public IReadOnlyList<DailyCollectionMetricDto> DailyCollections { get; init; }
        = Array.Empty<DailyCollectionMetricDto>();
}

public sealed class DashboardService
{
    private readonly ApplicationDbContext _db;

    public DashboardService(ApplicationDbContext db)
    {
        _db = db;
    }

    private static DateTime StartUtc(DateOnly date) =>
        new(date.Year, date.Month, date.Day, 0, 0, 0,
            DateTimeKind.Utc);

    private static DateTime EndExclusiveUtc(DateOnly date) =>
        StartUtc(date.AddDays(1));

    private static (DateTime Start, DateTime End) GetRange(
        DateOnly? from,
        DateOnly? to)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var startDate = from ?? today.AddDays(-29);
        var endDate = to ?? today;

        if (startDate > endDate)
            throw new ArgumentException(
                "From date cannot be after To date.");

        if (endDate.DayNumber - startDate.DayNumber > 365)
            throw new ArgumentException(
                "Dashboard date range cannot exceed 366 days.");

        return (StartUtc(startDate), EndExclusiveUtc(endDate));
    }

    private async Task<DashboardResponseDto> BuildAsync(
        IQueryable<Farmer> farmers,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        var (start, end) = GetRange(from, to);

        var farmerIds = farmers
            .Select(x => x.Id);

        var farmerCount = await farmers.CountAsync(ct);

        var collectorCount = await farmers
            .Where(x => x.CollectorId != null)
            .Select(x => x.CollectorId)
            .Distinct()
            .CountAsync(ct);

        var collectionsQuery = _db.Collections
            .AsNoTracking()
            .Where(x =>
                farmerIds.Contains(x.FarmerId) &&
                x.CollectedAt >= start &&
                x.CollectedAt < end);

        var collectionRows = await collectionsQuery
            .Select(x => new
            {
                x.Id,
                x.Status,
                x.GrossWeight,
                x.FinalWeight,
                x.TotalAmount,
                x.CollectedAt
            })
            .ToListAsync(ct);

        var ledgerRows = await _db.FinancialLedgerEntries
            .AsNoTracking()
            .Where(x =>
                farmerIds.Contains(x.FarmerId) &&
                x.OccurredAt >= start &&
                x.OccurredAt < end)
            .Select(x => new
            {
                x.TransactionType,
                x.Direction,
                x.Amount
            })
            .ToListAsync(ct);

        var collectionEarnings = ledgerRows
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.CollectionEarning &&
                x.Direction == FinancialDirection.Credit)
            .Sum(x => x.Amount);

        var materialDeductions = ledgerRows
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.Deduction &&
                x.Direction == FinancialDirection.Debit)
            .Sum(x => x.Amount);

        var loanRepayments = ledgerRows
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.LoanRepayment &&
                x.Direction == FinancialDirection.Debit)
            .Sum(x => x.Amount);

        var loanDisbursements = ledgerRows
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.LoanDisbursement &&
                x.Direction == FinancialDirection.Credit)
            .Sum(x => x.Amount);

        var outstandingLoans = await _db.Loans
            .AsNoTracking()
            .Where(x =>
                farmerIds.Contains(x.FarmerId) &&
                x.Status == LoanStatus.Active)
            .Select(x => new
            {
                x.PrincipalAmount,
                Repaid = x.Repayments.Sum(r => (decimal?)r.Amount) ?? 0m
            })
            .ToListAsync(ct);

        var outstandingBalance = outstandingLoans.Sum(x =>
            Math.Max(0m, x.PrincipalAmount - x.Repaid));

        var settlementRows = await _db.Settlements
            .AsNoTracking()
            .Where(x =>
                farmerIds.Contains(x.FarmerId) &&
                x.PeriodStart >= start &&
                x.PeriodStart < end)
            .Select(x => new
            {
                x.Status,
                x.NetSettlementAmount
            })
            .ToListAsync(ct);

        var dailyCollections = collectionRows
            .Where(x =>
                x.Status == CollectionStatus.Collected ||
                x.Status == CollectionStatus.Synced)
            .GroupBy(x => DateOnly.FromDateTime(x.CollectedAt))
            .Select(group => new DailyCollectionMetricDto
            {
                Date = group.Key,
                CollectionCount = group.Count(),
                FinalWeightKg = group.Sum(x => x.FinalWeight),
                Earnings = group.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Date)
            .ToList();

        var summary = new DashboardSummaryDto
        {
            GeneratedAtUtc = DateTime.UtcNow,
            FromUtc = start,
            ToUtc = end.AddTicks(-1),

            FarmerCount = farmerCount,
            CollectorCount = collectorCount,

            CollectionCount = collectionRows.Count,
            PendingCollectionCount = collectionRows.Count(
                x => x.Status == CollectionStatus.Pending),
            CollectedCollectionCount = collectionRows.Count(
                x => x.Status == CollectionStatus.Collected ||
                     x.Status == CollectionStatus.Synced),
            CancelledCollectionCount = collectionRows.Count(
                x => x.Status == CollectionStatus.Cancelled),

            TotalGrossWeightKg = collectionRows
                .Where(x =>
                    x.Status == CollectionStatus.Collected ||
                    x.Status == CollectionStatus.Synced)
                .Sum(x => x.GrossWeight),

            TotalFinalWeightKg = collectionRows
                .Where(x =>
                    x.Status == CollectionStatus.Collected ||
                    x.Status == CollectionStatus.Synced)
                .Sum(x => x.FinalWeight),

            CollectionEarnings = collectionEarnings,
            MaterialDeductions = materialDeductions,
            LoanRepayments = loanRepayments,
            LoanDisbursements = loanDisbursements,

            OutstandingLoanBalance = outstandingBalance,

            SettlementCount = settlementRows.Count,
            PaidSettlementCount = settlementRows.Count(
                x => x.Status == SettlementStatus.Paid),
            DraftSettlementCount = settlementRows.Count(
                x => x.Status == SettlementStatus.Draft),
            SettlementAmount = settlementRows
                .Where(x => x.Status == SettlementStatus.Paid)
                .Sum(x => x.NetSettlementAmount)
        };

        return new DashboardResponseDto
        {
            Summary = summary,
            DailyCollections = dailyCollections
        };
    }

    public async Task<DashboardResponseDto> GetAdminAsync(
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        return await BuildAsync(
            _db.Farmers.AsNoTracking(),
            from,
            to,
            ct);
    }

    public async Task<DashboardResponseDto> GetFarmerAsync(
        Guid farmerUserId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        var farmer = _db.Farmers
            .AsNoTracking()
            .Where(x => x.UserId == farmerUserId);

        if (!await farmer.AnyAsync(ct))
            throw new UnauthorizedAccessException(
                "Farmer profile not found.");

        return await BuildAsync(farmer, from, to, ct);
    }

    public async Task<DashboardResponseDto> GetCollectorAsync(
        Guid collectorUserId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct)
    {
        var collectorId = await _db.Collectors
            .AsNoTracking()
            .Where(x => x.UserId == collectorUserId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);

        if (!collectorId.HasValue)
            throw new UnauthorizedAccessException(
                "Collector profile not found.");

        var assignedFarmers = _db.Farmers
            .AsNoTracking()
            .Where(x => x.CollectorId == collectorId.Value);

        return await BuildAsync(
            assignedFarmers,
            from,
            to,
            ct);
    }
}
