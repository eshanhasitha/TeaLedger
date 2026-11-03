namespace TeaLedger.API.Models;

public enum FinancialTransactionType
{
    CollectionEarning = 1,
    Deduction = 2,
    LoanDisbursement = 3,
    LoanRepayment = 4,
    SettlementPayment = 5,
    Adjustment = 6
}

public enum FinancialDirection
{
    Credit = 1,
    Debit = 2
}

public sealed class FinancialLedgerEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FarmerId { get; set; }

    public Guid? CollectionId { get; set; }

    public FinancialTransactionType TransactionType { get; set; }

    public FinancialDirection Direction { get; set; }

    // Amount must always be positive.
    // Direction indicates whether it is a credit or debit.
    public decimal Amount { get; set; }

    public string Description { get; set; } = string.Empty;

    public string? Reference { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Farmer Farmer { get; set; } = null!;

    public Collection? Collection { get; set; }
}