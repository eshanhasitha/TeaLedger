namespace TeaLedger.API.Models;

public sealed class LoanRepayment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid LoanId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaidAt { get; set; } = DateTime.UtcNow;

    public Guid RecordedByUserId { get; set; }

    public string? Reference { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Loan Loan { get; set; } = null!;
    public FinancialLedgerEntry? LedgerEntry { get; set; }
}