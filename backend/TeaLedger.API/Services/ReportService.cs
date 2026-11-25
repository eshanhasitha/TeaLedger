using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Reports;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class ReportService
{
    private readonly ApplicationDbContext _db;

    public ReportService(ApplicationDbContext db)
    {
        _db = db;
    }

    private static (DateTime? Start, DateTime? EndExclusive) GetDateRange(
        DateOnly? from,
        DateOnly? to)
    {
        if (from.HasValue && to.HasValue && from.Value > to.Value)
            throw new ArgumentException("'from' must be before or equal to 'to'.");

        var start = from?.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endExclusive = to?
            .AddDays(1)
            .ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        return (start, endExclusive);
    }

    private static IQueryable<T> ApplyDateRange<T>(
        IQueryable<T> query,
        DateTime? start,
        DateTime? endExclusive,
        System.Linq.Expressions.Expression<Func<T, DateTime>> dateSelector)
    {
        if (start.HasValue)
        {
            var parameter = dateSelector.Parameters[0];
            var body = System.Linq.Expressions.Expression.GreaterThanOrEqual(
                dateSelector.Body,
                System.Linq.Expressions.Expression.Constant(start.Value));

            query = query.Where(
                System.Linq.Expressions.Expression.Lambda<Func<T, bool>>(
                    body, parameter));
        }

        if (endExclusive.HasValue)
        {
            var parameter = dateSelector.Parameters[0];
            var body = System.Linq.Expressions.Expression.LessThan(
                dateSelector.Body,
                System.Linq.Expressions.Expression.Constant(endExclusive.Value));

            query = query.Where(
                System.Linq.Expressions.Expression.Lambda<Func<T, bool>>(
                    body, parameter));
        }

        return query;
    }

    private static void ValidatePaging(int page, int pageSize)
    {
        if (page < 1)
            throw new ArgumentException("Page must be at least 1.");

        if (pageSize is < 1 or > 100)
            throw new ArgumentException("Page size must be between 1 and 100.");
    }

    public async Task<PagedReport<CollectionReportRow>> GetCollectionsAsync(
        DateOnly? from,
        DateOnly? to,
        Guid? farmerId,
        Guid? collectorId,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        ValidatePaging(page, pageSize);
        var (start, endExclusive) = GetDateRange(from, to);

        var query =
            from collection in _db.Collections.AsNoTracking()
            join farmer in _db.Farmers.AsNoTracking()
                on collection.FarmerId equals farmer.Id
            join farmerUser in _db.Users.AsNoTracking()
                on farmer.UserId equals farmerUser.Id
            join collector in _db.Collectors.AsNoTracking()
                on collection.CollectorId equals collector.Id into collectorJoin
            from collector in collectorJoin.DefaultIfEmpty()
            join collectorUser in _db.Users.AsNoTracking()
                on collector!.UserId equals collectorUser.Id into collectorUserJoin
            from collectorUser in collectorUserJoin.DefaultIfEmpty()
            select new
            {
                Collection = collection,
                FarmerName = farmerUser.FullName,
                CollectorName = collectorUser == null
                    ? null
                    : collectorUser.FullName
            };

        if (start.HasValue)
            query = query.Where(x => x.Collection.CollectedAt >= start.Value);

        if (endExclusive.HasValue)
            query = query.Where(x => x.Collection.CollectedAt < endExclusive.Value);

        if (farmerId.HasValue)
            query = query.Where(x => x.Collection.FarmerId == farmerId.Value);

        if (collectorId.HasValue)
            query = query.Where(x => x.Collection.CollectorId == collectorId.Value);

        var totalCount = await query.CountAsync(ct);

        var rows = await query
            .OrderByDescending(x => x.Collection.CollectedAt)
            .ThenBy(x => x.Collection.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new CollectionReportRow(
                x.Collection.Id,
                x.Collection.FarmerId,
                x.FarmerName,
                x.Collection.CollectorId,
                x.CollectorName,
                x.Collection.GrossWeight,
                x.Collection.FinalWeight,
                x.Collection.PricePerKg,
                x.Collection.TotalAmount,
                x.Collection.Status.ToString(),
                x.Collection.CollectedAt))
            .ToListAsync(ct);

        return new PagedReport<CollectionReportRow>(
            rows, page, pageSize, totalCount,
            (int)Math.Ceiling(totalCount / (double)pageSize));
    }

    public async Task<PagedReport<EarningsReportRow>> GetEarningsAsync(
        DateOnly? from,
        DateOnly? to,
        Guid? farmerId,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        ValidatePaging(page, pageSize);
        var (start, endExclusive) = GetDateRange(from, to);

        var query =
            from entry in _db.FinancialLedgerEntries.AsNoTracking()
            join farmer in _db.Farmers.AsNoTracking()
                on entry.FarmerId equals farmer.Id
            join user in _db.Users.AsNoTracking()
                on farmer.UserId equals user.Id
            where entry.TransactionType == FinancialTransactionType.CollectionEarning
                  && entry.Direction == FinancialDirection.Credit
            select new
            {
                Entry = entry,
                FarmerName = user.FullName
            };

        if (start.HasValue)
            query = query.Where(x => x.Entry.OccurredAt >= start.Value);

        if (endExclusive.HasValue)
            query = query.Where(x => x.Entry.OccurredAt < endExclusive.Value);

        if (farmerId.HasValue)
            query = query.Where(x => x.Entry.FarmerId == farmerId.Value);

        var totalCount = await query.CountAsync(ct);

        var rows = await query
            .OrderByDescending(x => x.Entry.OccurredAt)
            .ThenBy(x => x.Entry.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new EarningsReportRow(
                x.Entry.Id,
                x.Entry.FarmerId,
                x.FarmerName,
                x.Entry.Amount,
                x.Entry.Description,
                x.Entry.Reference,
                x.Entry.OccurredAt))
            .ToListAsync(ct);

        return new PagedReport<EarningsReportRow>(
            rows, page, pageSize, totalCount,
            (int)Math.Ceiling(totalCount / (double)pageSize));
    }

    public async Task<PagedReport<DeductionReportRow>> GetDeductionsAsync(
        DateOnly? from,
        DateOnly? to,
        Guid? farmerId,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        ValidatePaging(page, pageSize);
        var (start, endExclusive) = GetDateRange(from, to);

        var query =
            from deduction in _db.Deductions.AsNoTracking()
            join farmer in _db.Farmers.AsNoTracking()
                on deduction.FarmerId equals farmer.Id
            join user in _db.Users.AsNoTracking()
                on farmer.UserId equals user.Id
            select new
            {
                Deduction = deduction,
                FarmerName = user.FullName
            };

        if (start.HasValue)
            query = query.Where(x => x.Deduction.OccurredAt >= start.Value);

        if (endExclusive.HasValue)
            query = query.Where(x => x.Deduction.OccurredAt < endExclusive.Value);

        if (farmerId.HasValue)
            query = query.Where(x => x.Deduction.FarmerId == farmerId.Value);

        var totalCount = await query.CountAsync(ct);

        var rows = await query
            .OrderByDescending(x => x.Deduction.OccurredAt)
            .ThenBy(x => x.Deduction.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new DeductionReportRow(
                x.Deduction.Id,
                x.Deduction.FarmerId,
                x.FarmerName,
                x.Deduction.Category.ToString(),
                x.Deduction.Description,
                x.Deduction.Quantity,
                x.Deduction.Unit,
                x.Deduction.UnitPrice,
                x.Deduction.Amount,
                x.Deduction.OccurredAt))
            .ToListAsync(ct);

        return new PagedReport<DeductionReportRow>(
            rows, page, pageSize, totalCount,
            (int)Math.Ceiling(totalCount / (double)pageSize));
    }

    public async Task<IReadOnlyList<FarmerLoanReportRow>> GetFarmerLoansAsync(
        Guid farmerId,
        CancellationToken ct)
    {
        var loans = await _db.Loans
            .AsNoTracking()
            .Where(x => x.FarmerId == farmerId)
            .OrderByDescending(x => x.IssuedAt)
            .Select(x => new
            {
                x.Id,
                x.PrincipalAmount,
                x.Status,
                x.IssuedAt,
                RepaidAmount = x.Repayments.Sum(r => (decimal?)r.Amount) ?? 0m
            })
            .ToListAsync(ct);

        return loans.Select(x => new FarmerLoanReportRow(
            x.Id,
            x.PrincipalAmount,
            x.RepaidAmount,
            Math.Max(0m, x.PrincipalAmount - x.RepaidAmount),
            x.Status.ToString(),
            x.IssuedAt)).ToList();
    }

    public async Task<Guid?> GetFarmerIdForUserAsync(
        Guid userId,
        CancellationToken ct)
    {
        return await _db.Farmers
            .Where(x => x.UserId == userId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);
    }

    public async Task<Guid?> GetCollectorIdForUserAsync(
        Guid userId,
        CancellationToken ct)
    {
        return await _db.Collectors
            .Where(x => x.UserId == userId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);
    }
}