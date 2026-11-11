
using System.Data;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Settlements;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class SettlementService : ISettlementService
{
    private readonly ApplicationDbContext _db;

    public SettlementService(ApplicationDbContext db)
    {
        _db = db;
    }

    public static decimal CalculateNetSettlement(
        decimal grossTeaIncome,
        decimal materialDeductions,
        decimal loanRepayments)
    {
        if (grossTeaIncome < 0)
            throw new ArgumentOutOfRangeException(
                nameof(grossTeaIncome));

        if (materialDeductions < 0)
            throw new ArgumentOutOfRangeException(
                nameof(materialDeductions));

        if (loanRepayments < 0)
            throw new ArgumentOutOfRangeException(
                nameof(loanRepayments));

        var result = decimal.Round(
            grossTeaIncome - materialDeductions - loanRepayments,
            2,
            MidpointRounding.AwayFromZero);

        if (result < 0)
            throw new InvalidOperationException(
                "Deductions and loan repayments exceed gross tea income.");

        return result;
    }

    private static DateTime MonthStartUtc(int year, int month)
    {
        return new DateTime(
            year, month, 1, 0, 0, 0, DateTimeKind.Utc);
    }

    private static SettlementDto Map(Settlement x)
    {
        return new SettlementDto
        {
            Id = x.Id,
            FarmerId = x.FarmerId,
            FarmerName = x.Farmer.User.FullName,
            FarmerCode = x.Farmer.FarmerCode,
            Year = x.Year,
            Month = x.Month,
            PeriodStart = x.PeriodStart,
            PeriodEnd = x.PeriodEnd,
            GrossTeaIncome = x.GrossTeaIncome,
            TotalTeaQuantityKg = x.TotalTeaQuantityKg,
            AverageTeaPricePerKg = x.AverageTeaPricePerKg,
            MaterialDeductions = x.MaterialDeductions,
            TotalDeductionQuantityKg = x.TotalDeductionQuantityKg,
            DeductionBreakdown = x.DeductionBreakdown
                .OrderBy(d => d.Category)
                .ThenBy(d => d.Unit)
                .ThenBy(d => d.UnitPrice)
                .Select(d => new SettlementDeductionBreakdownDto
                {
                    Category = d.Category.ToString(),
                    Unit = d.Unit,
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice,
                    Amount = d.Amount
                })
                .ToList(),
            LoanRepayments = x.LoanRepayments,
            RemainingLoanBalance = x.RemainingLoanBalance,
            NetSettlementAmount = x.NetSettlementAmount,
            Status = x.Status,
            CreatedAt = x.CreatedAt,
            PaidAt = x.PaidAt
        };
    }

    private IQueryable<Settlement> SettlementQuery()
    {
        return _db.Settlements
            .AsNoTracking()
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .Include(x => x.DeductionBreakdown);
    }

    private async Task<Guid> GetFarmerIdAsync(
        Guid farmerUserId,
        CancellationToken ct)
    {
        var farmerId = await _db.Farmers
            .Where(x => x.UserId == farmerUserId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);

        return farmerId ??
            throw new UnauthorizedAccessException(
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

        return collectorId ??
            throw new UnauthorizedAccessException(
                "Collector profile not found.");
    }

    public async Task<SettlementDto> CreateAsync(
        Guid adminUserId,
        CreateSettlementDto input,
        CancellationToken ct)
    {
        if (input.FarmerId == Guid.Empty)
            throw new ArgumentException("FarmerId is required.");

        if (input.Year < 2020 || input.Year > 2100)
            throw new ArgumentException("Invalid settlement year.");

        if (input.Month < 1 || input.Month > 12)
            throw new ArgumentException("Invalid settlement month.");

        var farmer = await _db.Farmers
            .Include(x => x.User)
            .SingleOrDefaultAsync(
                x => x.Id == input.FarmerId,
                ct);

        if (farmer is null)
            throw new KeyNotFoundException("Farmer not found.");

        if (!farmer.IsActive || !farmer.User.IsActive)
            throw new InvalidOperationException(
                "Cannot create a settlement for an inactive farmer.");

        var start = MonthStartUtc(input.Year, input.Month);
        var end = start.AddMonths(1);

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable, ct);

        var exists = await _db.Settlements.AnyAsync(
            x => x.FarmerId == input.FarmerId &&
                 x.Year == input.Year &&
                 x.Month == input.Month,
            ct);

        if (exists)
            throw new InvalidOperationException(
                "A settlement already exists for this farmer and month.");

        var ledgerEntries = await _db.FinancialLedgerEntries
            .AsNoTracking()
            .Where(x =>
                x.FarmerId == input.FarmerId &&
                x.OccurredAt >= start &&
                x.OccurredAt < end)
            .Select(x => new
            {
                x.TransactionType,
                x.Direction,
                x.Amount,
                PaymentMethod = x.LoanRepayment == null
                    ? (LoanRepaymentMethod?)null
                    : x.LoanRepayment.PaymentMethod
            })
            .ToListAsync(ct);

        var grossIncome = ledgerEntries
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.CollectionEarning &&
                x.Direction == FinancialDirection.Credit)
            .Sum(x => x.Amount);

        var materialDeductions = ledgerEntries
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.Deduction &&
                x.Direction == FinancialDirection.Debit)
            .Sum(x => x.Amount);

        var loanRepayments = ledgerEntries
            .Where(x =>
                x.TransactionType ==
                    FinancialTransactionType.LoanRepayment &&
                x.Direction == FinancialDirection.Debit &&
                x.PaymentMethod == LoanRepaymentMethod.TeaProceeds)
            .Sum(x => x.Amount);

        var availableForLoanRepayment =
            grossIncome - materialDeductions - loanRepayments;

        if (input.LoanRepaymentAmount < 0)
            throw new ArgumentOutOfRangeException(
                nameof(input.LoanRepaymentAmount),
                "Loan repayment amount cannot be negative.");

        var roundedLoanRepayment = decimal.Round(
            input.LoanRepaymentAmount,
            2,
            MidpointRounding.AwayFromZero);

        if (roundedLoanRepayment != input.LoanRepaymentAmount)
            throw new ArgumentException(
                "Loan repayment amount can have a maximum of two decimal places.");

        if (input.LoanRepaymentAmount > availableForLoanRepayment)
            throw new InvalidOperationException(
                "Loan repayment cannot exceed the remaining tea settlement amount.");

        var activeLoans = await _db.Loans
            .Include(x => x.Repayments)
            .Where(x =>
                x.FarmerId == farmer.Id &&
                x.Status == LoanStatus.Active)
            .OrderBy(x => x.IssuedAt)
            .ThenBy(x => x.Id)
            .ToListAsync(ct);

        var outstandingLoanBalance = activeLoans.Sum(loan =>
            LoanService.CalculateOutstandingBalance(
                loan.PrincipalAmount,
                loan.Repayments.Sum(repayment => repayment.Amount)));

        if (input.LoanRepaymentAmount > outstandingLoanBalance)
            throw new InvalidOperationException(
                "Loan repayment cannot exceed the farmer's outstanding loan balance.");

        var now = DateTime.UtcNow;
        var repaymentOccurredAt = end.AddTicks(-1);
        var remainingRepayment = input.LoanRepaymentAmount;
        var newRepayments = new List<LoanRepayment>();
        var newRepaymentEntries = new List<FinancialLedgerEntry>();

        foreach (var loan in activeLoans)
        {
            if (remainingRepayment == 0)
                break;

            var loanOutstanding = LoanService.CalculateOutstandingBalance(
                loan.PrincipalAmount,
                loan.Repayments.Sum(repayment => repayment.Amount));

            if (loanOutstanding == 0)
                continue;

            var amount = Math.Min(loanOutstanding, remainingRepayment);
            var repayment = new LoanRepayment
            {
                Id = Guid.NewGuid(),
                LoanId = loan.Id,
                Amount = amount,
                PaymentMethod = LoanRepaymentMethod.TeaProceeds,
                PaidAt = repaymentOccurredAt,
                RecordedByUserId = adminUserId,
                Reference = $"Settlement {input.Year}-{input.Month:D2}",
                Notes = "Withheld from monthly tea settlement.",
                CreatedAt = now
            };

            loan.Repayments.Add(repayment);
            newRepayments.Add(repayment);
            loan.UpdatedAt = now;
            newRepaymentEntries.Add(new FinancialLedgerEntry
            {
                Id = Guid.NewGuid(),
                FarmerId = farmer.Id,
                LoanRepaymentId = repayment.Id,
                TransactionType = FinancialTransactionType.LoanRepayment,
                Direction = FinancialDirection.Debit,
                Amount = amount,
                Description = "Loan repayment withheld from tea settlement",
                Reference = repayment.Id.ToString(),
                OccurredAt = repaymentOccurredAt,
                CreatedAt = now
            });

            remainingRepayment -= amount;
            if (amount == loanOutstanding)
            {
                loan.Status = LoanStatus.Closed;
                loan.UpdatedAt = now;
            }
        }

        loanRepayments += input.LoanRepaymentAmount;
        outstandingLoanBalance -= input.LoanRepaymentAmount;

        var totalTeaQuantityKg = await _db.Collections
            .Where(x =>
                x.FarmerId == input.FarmerId &&
                x.CollectedAt >= start &&
                x.CollectedAt < end &&
                (x.Status == CollectionStatus.Collected ||
                 x.Status == CollectionStatus.Synced))
            .SumAsync(x => (decimal?)x.FinalWeight, ct) ?? 0m;

        var monthlyDeductions = await _db.Deductions
            .AsNoTracking()
            .Where(x =>
                x.FarmerId == input.FarmerId &&
                x.OccurredAt >= start &&
                x.OccurredAt < end)
            .Select(x => new
            {
                x.Category,
                x.Unit,
                x.Quantity,
                x.UnitPrice,
                x.Amount
            })
            .ToListAsync(ct);

        var deductionBreakdown = monthlyDeductions
            .GroupBy(x => new
            {
                x.Category,
                Unit = x.Unit.Trim(),
                x.UnitPrice
            })
            .Select(group => new SettlementDeductionBreakdown
            {
                Id = Guid.NewGuid(),
                SettlementId = Guid.Empty,
                Category = group.Key.Category,
                Unit = group.Key.Unit,
                Quantity = group.Sum(x => x.Quantity),
                UnitPrice = group.Key.UnitPrice,
                Amount = group.Sum(x => x.Amount)
            })
            .ToList();

        var totalDeductionQuantityKg = deductionBreakdown
            .Where(x => IsKilogramUnit(x.Unit))
            .Sum(x => x.Quantity);

        var averageTeaPricePerKg = totalTeaQuantityKg == 0
            ? 0m
            : decimal.Round(
                grossIncome / totalTeaQuantityKg,
                2,
                MidpointRounding.AwayFromZero);

        var netAmount = CalculateNetSettlement(
            grossIncome,
            materialDeductions,
            loanRepayments);

        var settlement = new Settlement
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            Year = input.Year,
            Month = input.Month,
            PeriodStart = start,
            PeriodEnd = end.AddTicks(-1),
            GrossTeaIncome = grossIncome,
            TotalTeaQuantityKg = totalTeaQuantityKg,
            AverageTeaPricePerKg = averageTeaPricePerKg,
            MaterialDeductions = materialDeductions,
            TotalDeductionQuantityKg = totalDeductionQuantityKg,
            LoanRepayments = loanRepayments,
            RemainingLoanBalance = outstandingLoanBalance,
            NetSettlementAmount = netAmount,
            Status = SettlementStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = adminUserId
        };

        foreach (var breakdown in deductionBreakdown)
        {
            breakdown.SettlementId = settlement.Id;
            breakdown.Settlement = settlement;
            settlement.DeductionBreakdown.Add(breakdown);
        }

        _db.Settlements.Add(settlement);
        _db.LoanRepayments.AddRange(newRepayments);
        _db.FinancialLedgerEntries.AddRange(newRepaymentEntries);

        _db.ActivityLogs.Add(new ActivityLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = adminUserId,
            Action = "SettlementCreated",
            EntityType = "Settlement",
            EntityId = settlement.Id,
            Details =
                $"FarmerId={farmer.Id}; " +
                $"Year={input.Year}; Month={input.Month}; " +
                $"Gross={grossIncome}; " +
                $"LoanRepayment={input.LoanRepaymentAmount}; " +
                $"RemainingLoanBalance={outstandingLoanBalance}; " +
                $"Net={netAmount}",
            OccurredAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Map(await SettlementQuery()
            .SingleAsync(x => x.Id == settlement.Id, ct));
    }

    public async Task<SettlementDto> MarkPaidAsync(
        Guid adminUserId,
        Guid settlementId,
        CancellationToken ct)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable, ct);

        var settlement = await _db.Settlements
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .Include(x => x.DeductionBreakdown)
            .SingleOrDefaultAsync(
                x => x.Id == settlementId,
                ct);

        if (settlement is null)
            throw new KeyNotFoundException("Settlement not found.");

        if (settlement.Status != SettlementStatus.Draft)
            throw new InvalidOperationException(
                "Only draft settlements can be marked as paid.");

        if (settlement.NetSettlementAmount <= 0)
            throw new InvalidOperationException(
                "A settlement with zero or negative payment cannot be marked as paid.");

        if (settlement.PaymentLedgerEntry != null)
            throw new InvalidOperationException(
                "A payment ledger entry already exists for this settlement.");

        var now = DateTime.UtcNow;

        var paymentEntry = new FinancialLedgerEntry
        {
            Id = Guid.NewGuid(),
            FarmerId = settlement.FarmerId,
            SettlementId = settlement.Id,
            CollectionId = null,
            DeductionId = null,
            LoanRepaymentId = null,
            TransactionType =
                FinancialTransactionType.SettlementPayment,
            Direction = FinancialDirection.Debit,
            Amount = settlement.NetSettlementAmount,
            Description =
                $"Monthly settlement payment: " +
                $"{settlement.Year}-{settlement.Month:D2}",
            Reference = settlement.Id.ToString(),
            OccurredAt = now,
            CreatedAt = now
        };

        settlement.Status = SettlementStatus.Paid;
        settlement.PaidAt = now;

        _db.FinancialLedgerEntries.Add(paymentEntry);

        _db.ActivityLogs.Add(new ActivityLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = adminUserId,
            Action = "SettlementPaid",
            EntityType = "Settlement",
            EntityId = settlement.Id,
            Details =
                $"FarmerId={settlement.FarmerId}; " +
                $"Amount={settlement.NetSettlementAmount}",
            OccurredAt = now
        });

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Map(settlement);
    }

    private static bool IsKilogramUnit(string unit)
    {
        return unit.Trim().Equals("kg", StringComparison.OrdinalIgnoreCase) ||
               unit.Trim().Equals("kgs", StringComparison.OrdinalIgnoreCase) ||
               unit.Trim().Equals("kilogram", StringComparison.OrdinalIgnoreCase) ||
               unit.Trim().Equals("kilograms", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<IReadOnlyList<SettlementDto>>
        GetAdminSettlementsAsync(
            int? year,
            int? month,
            string? status,
            CancellationToken ct)
    {
        if (year.HasValue &&
            (year < 2020 || year > 2100))
            throw new ArgumentException("Invalid year.");

        if (month.HasValue &&
            (month < 1 || month > 12))
            throw new ArgumentException("Invalid month.");

        var query = SettlementQuery();

        if (year.HasValue)
            query = query.Where(x => x.Year == year.Value);

        if (month.HasValue)
            query = query.Where(x => x.Month == month.Value);

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<SettlementStatus>(
                    status, true, out var parsedStatus))
                throw new ArgumentException(
                    "Invalid settlement status.");

            query = query.Where(x => x.Status == parsedStatus);
        }

        var rows = await query
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .ThenBy(x => x.Farmer.FarmerCode)
            .ToListAsync(ct);

        return rows.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<SettlementDto>>
        GetFarmerSettlementsAsync(
            Guid farmerUserId,
            CancellationToken ct)
    {
        var farmerId = await GetFarmerIdAsync(
            farmerUserId, ct);

        var rows = await SettlementQuery()
            .Where(x => x.FarmerId == farmerId)
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .ToListAsync(ct);

        return rows.Select(Map).ToList();
    }

    public async Task<SettlementDto> GetFarmerSettlementAsync(
        Guid farmerUserId,
        Guid settlementId,
        CancellationToken ct)
    {
        var farmerId = await GetFarmerIdAsync(
            farmerUserId, ct);

        var settlement = await SettlementQuery()
            .SingleOrDefaultAsync(
                x => x.Id == settlementId &&
                     x.FarmerId == farmerId,
                ct);

        if (settlement is null)
            throw new KeyNotFoundException(
                "Settlement not found.");

        return Map(settlement);
    }

    public async Task<IReadOnlyList<SettlementDto>>
        GetCollectorSettlementsAsync(
            Guid collectorUserId,
            CancellationToken ct)
    {
        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        var rows = await SettlementQuery()
            .Where(x => x.Farmer.CollectorId == collectorId)
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .ToListAsync(ct);

        return rows.Select(Map).ToList();
    }
}
