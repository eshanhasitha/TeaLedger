using System.Data;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Loans;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class LoanService : ILoanService
{
    private readonly ApplicationDbContext _db;

    public LoanService(ApplicationDbContext db)
    {
        _db = db;
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

    private static LoanDto MapLoan(Loan loan)
    {
        var repayments = loan.Repayments
            .OrderBy(x => x.PaidAt)
            .ToList();

        var totalRepaid = repayments.Sum(x => x.Amount);

        return new LoanDto
        {
            Id = loan.Id,
            FarmerId = loan.FarmerId,
            FarmerName = loan.Farmer.User.FullName,
            FarmerCode = loan.Farmer.FarmerCode,
            CollectorId = loan.CollectorId,
            PrincipalAmount = loan.PrincipalAmount,
            TotalRepaid = totalRepaid,
            OutstandingBalance = Math.Max(
                0m,
                loan.PrincipalAmount - totalRepaid),
            IssuedAt = loan.IssuedAt,
            Status = loan.Status,
            Notes = loan.Notes,
            CreatedAt = loan.CreatedAt,
            Repayments = repayments.Select(x => new LoanRepaymentDto
            {
                Id = x.Id,
                LoanId = x.LoanId,
                Amount = x.Amount,
                PaidAt = x.PaidAt,
                RecordedByUserId = x.RecordedByUserId,
                Reference = x.Reference,
                Notes = x.Notes,
                CreatedAt = x.CreatedAt
            }).ToList()
        };
    }

    private IQueryable<Loan> LoanQuery()
    {
        return _db.Loans
            .AsNoTracking()
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .Include(x => x.Repayments);
    }

    public async Task<LoanDto> CreateLoanAsync(
        Guid collectorUserId,
        Guid farmerId,
        CreateLoanDto input,
        CancellationToken ct)
    {
        if (input.PrincipalAmount <= 0)
            throw new ArgumentException(
                "Loan amount must be greater than zero.");

        var amount = decimal.Round(
            input.PrincipalAmount,
            2,
            MidpointRounding.AwayFromZero);

        if (amount != input.PrincipalAmount)
            throw new ArgumentException(
                "Loan amount can have a maximum of two decimal places.");

        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        var farmer = await _db.Farmers
            .Include(x => x.User)
            .SingleOrDefaultAsync(
                x => x.Id == farmerId &&
                     x.CollectorId == collectorId,
                ct);

        if (farmer is null)
            throw new InvalidOperationException(
                "Farmer was not found under this collector.");

        if (!farmer.IsActive || !farmer.User.IsActive)
            throw new InvalidOperationException(
                "Cannot issue a loan to an inactive farmer.");

        var now = DateTime.UtcNow;
        var issuedAt = input.IssuedAt?.ToUniversalTime() ?? now;

        if (issuedAt > now.AddMinutes(5))
            throw new ArgumentException(
                "Loan issue date cannot be in the future.");

        var loan = new Loan
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            CollectorId = collectorId,
            PrincipalAmount = amount,
            IssuedAt = issuedAt,
            Status = LoanStatus.Active,
            Notes = string.IsNullOrWhiteSpace(input.Notes)
                ? null
                : input.Notes.Trim(),
            CreatedByUserId = collectorUserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        var ledgerEntry = new FinancialLedgerEntry
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            CollectionId = null,
            TransactionType =
                FinancialTransactionType.LoanDisbursement,
            Direction = FinancialDirection.Debit,
            Amount = amount,
            Description = "Loan issued to farmer",
            Reference = loan.Id.ToString(),
            OccurredAt = issuedAt,
            CreatedAt = now
        };

        var audit = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = collectorUserId,
            Action = "LoanCreated",
            EntityType = "Loan",
            EntityId = loan.Id,
            Details =
                $"FarmerId={farmer.Id}; " +
                $"CollectorId={collectorId}; " +
                $"PrincipalAmount={amount}",
            OccurredAt = now
        };

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable, ct);

        _db.Loans.Add(loan);
        _db.FinancialLedgerEntries.Add(ledgerEntry);
        _db.ActivityLogs.Add(audit);

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        loan.Farmer = farmer;
        loan.Repayments = [];

        return MapLoan(loan);
    }

    public async Task<LoanRepaymentDto> RecordRepaymentAsync(
        Guid collectorUserId,
        Guid loanId,
        CreateLoanRepaymentDto input,
        CancellationToken ct)
    {
        if (input.Amount <= 0)
            throw new ArgumentException(
                "Repayment amount must be greater than zero.");

        var amount = decimal.Round(
            input.Amount,
            2,
            MidpointRounding.AwayFromZero);

        if (amount != input.Amount)
            throw new ArgumentException(
                "Repayment amount can have a maximum of two decimal places.");

        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable, ct);

        var loan = await _db.Loans
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .Include(x => x.Repayments)
            .SingleOrDefaultAsync(
                x => x.Id == loanId &&
                     x.CollectorId == collectorId,
                ct);

        if (loan is null)
            throw new InvalidOperationException(
                "Loan was not found for this collector.");

        if (loan.Status != LoanStatus.Active)
            throw new InvalidOperationException(
                "Repayments can only be recorded for active loans.");

        var totalRepaid = loan.Repayments.Sum(x => x.Amount);
        var outstanding = loan.PrincipalAmount - totalRepaid;

        if (outstanding <= 0)
            throw new InvalidOperationException(
                "This loan has already been fully repaid.");

        if (amount > outstanding)
            throw new InvalidOperationException(
                $"Repayment exceeds outstanding balance of {outstanding:0.00}.");

        var now = DateTime.UtcNow;
        var paidAt = input.PaidAt?.ToUniversalTime() ?? now;

        if (paidAt > now.AddMinutes(5))
            throw new ArgumentException(
                "Repayment date cannot be in the future.");

        if (paidAt < loan.IssuedAt)
            throw new ArgumentException(
                "Repayment date cannot be before the loan issue date.");

        var repayment = new LoanRepayment
        {
            Id = Guid.NewGuid(),
            LoanId = loan.Id,
            Amount = amount,
            PaidAt = paidAt,
            RecordedByUserId = collectorUserId,
            Reference = string.IsNullOrWhiteSpace(input.Reference)
                ? null
                : input.Reference.Trim(),
            Notes = string.IsNullOrWhiteSpace(input.Notes)
                ? null
                : input.Notes.Trim(),
            CreatedAt = now
        };

        var ledgerEntry = new FinancialLedgerEntry
        {
            Id = Guid.NewGuid(),
            FarmerId = loan.FarmerId,
            CollectionId = null,
            TransactionType =
                FinancialTransactionType.LoanRepayment,
            Direction = FinancialDirection.Debit,
            Amount = amount,
            Description = "Loan repayment recorded",
            Reference = repayment.Id.ToString(),
            OccurredAt = paidAt,
            CreatedAt = now
        };

        var newOutstanding = outstanding - amount;

        if (newOutstanding == 0)
            loan.Status = LoanStatus.Closed;

        loan.UpdatedAt = now;

        var audit = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = collectorUserId,
            Action = "LoanRepaymentRecorded",
            EntityType = "LoanRepayment",
            EntityId = repayment.Id,
            Details =
                $"LoanId={loan.Id}; " +
                $"FarmerId={loan.FarmerId}; " +
                $"Amount={amount}; " +
                $"OutstandingBalance={newOutstanding}",
            OccurredAt = now
        };

        _db.LoanRepayments.Add(repayment);
        _db.FinancialLedgerEntries.Add(ledgerEntry);
        _db.ActivityLogs.Add(audit);

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new LoanRepaymentDto
        {
            Id = repayment.Id,
            LoanId = repayment.LoanId,
            Amount = repayment.Amount,
            PaidAt = repayment.PaidAt,
            RecordedByUserId = repayment.RecordedByUserId,
            Reference = repayment.Reference,
            Notes = repayment.Notes,
            CreatedAt = repayment.CreatedAt
        };
    }

    public async Task<IReadOnlyList<LoanDto>> GetCollectorLoansAsync(
        Guid collectorUserId,
        Guid? farmerId,
        CancellationToken ct)
    {
        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        var query = LoanQuery()
            .Where(x => x.CollectorId == collectorId);

        if (farmerId.HasValue)
            query = query.Where(x => x.FarmerId == farmerId.Value);

        var loans = await query
            .OrderByDescending(x => x.IssuedAt)
            .ToListAsync(ct);

        return loans.Select(MapLoan).ToList();
    }

    public async Task<IReadOnlyList<LoanDto>> GetFarmerLoansAsync(
        Guid farmerUserId,
        CancellationToken ct)
    {
        var farmerId = await GetFarmerIdAsync(
            farmerUserId, ct);

        var loans = await LoanQuery()
            .Where(x => x.FarmerId == farmerId)
            .OrderByDescending(x => x.IssuedAt)
            .ToListAsync(ct);

        return loans.Select(MapLoan).ToList();
    }

    public async Task<LoanDto?> GetFarmerLoanAsync(
        Guid farmerUserId,
        Guid loanId,
        CancellationToken ct)
    {
        var farmerId = await GetFarmerIdAsync(
            farmerUserId, ct);

        var loan = await LoanQuery()
            .SingleOrDefaultAsync(
                x => x.Id == loanId &&
                     x.FarmerId == farmerId,
                ct);

        return loan is null ? null : MapLoan(loan);
    }

    public async Task<IReadOnlyList<LoanDto>> GetAdminLoansAsync(
        Guid? farmerId,
        Guid? collectorId,
        CancellationToken ct)
    {
        var query = LoanQuery();

        if (farmerId.HasValue)
            query = query.Where(x => x.FarmerId == farmerId.Value);

        if (collectorId.HasValue)
            query = query.Where(x => x.CollectorId == collectorId.Value);

        var loans = await query
            .OrderByDescending(x => x.IssuedAt)
            .ToListAsync(ct);

        return loans.Select(MapLoan).ToList();
    }

    public async Task<LoanDto?> GetCollectorLoanAsync(
        Guid collectorUserId,
        Guid loanId,
        CancellationToken ct)
    {
        var collectorId = await GetCollectorIdAsync(
            collectorUserId, ct);

        var loan = await LoanQuery()
            .SingleOrDefaultAsync(
                x => x.Id == loanId &&
                     x.CollectorId == collectorId,
                ct);

        return loan is null ? null : MapLoan(loan);
    }
}