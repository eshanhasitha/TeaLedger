
namespace TeaLedger.API.Models;

public enum SettlementStatus
{
    Draft = 1,
    Paid = 2,
    Cancelled = 3
}

public sealed class Settlement
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FarmerId { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public decimal GrossTeaIncome { get; set; }

    public decimal TotalTeaQuantityKg { get; set; }

    public decimal AverageTeaPricePerKg { get; set; }

    public decimal MaterialDeductions { get; set; }

    public decimal TotalDeductionQuantityKg { get; set; }

    public decimal LoanRepayments { get; set; }

    public decimal RemainingLoanBalance { get; set; }

    public decimal NetSettlementAmount { get; set; }

    public SettlementStatus Status { get; set; } =
        SettlementStatus.Draft;

    public DateTime PeriodStart { get; set; }

    public DateTime PeriodEnd { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? PaidAt { get; set; }

    public Guid CreatedByUserId { get; set; }

    public FinancialLedgerEntry? PaymentLedgerEntry { get; set; }

    public ICollection<SettlementDeductionBreakdown> DeductionBreakdown { get; set; }
        = new List<SettlementDeductionBreakdown>();

    public Farmer Farmer { get; set; } = null!;
}
