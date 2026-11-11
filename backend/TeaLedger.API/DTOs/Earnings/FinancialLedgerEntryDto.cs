using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Earnings;

public sealed class FinancialLedgerEntryDto
{
    public Guid Id { get; set; }

    public Guid? CollectionId { get; set; }

    public Guid? DeductionId { get; set; }

    public Guid? LoanRepaymentId { get; set; }
    public Guid? SettlementId { get; set; }

    public FinancialTransactionType TransactionType { get; set; }

    public FinancialDirection Direction { get; set; }

    public decimal Amount { get; set; }

    public string Description { get; set; } = string.Empty;

    public string? Reference { get; set; }

    public DateTime OccurredAt { get; set; }
    public Settlement? Settlement { get; set; }
}