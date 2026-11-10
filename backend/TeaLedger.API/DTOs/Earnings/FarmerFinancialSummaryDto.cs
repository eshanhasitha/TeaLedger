namespace TeaLedger.API.DTOs.Earnings;

public sealed class FarmerFinancialSummaryDto
{
    public Guid FarmerId { get; set; }

    public DateOnly From { get; set; }

    public DateOnly To { get; set; }

    public decimal CollectionEarnings { get; set; }

    public decimal MaterialDeductions { get; set; }

    public decimal LoanDisbursements { get; set; }

    public decimal LoanRepayments { get; set; }

    public decimal SettlementPayments { get; set; }

    public decimal AdjustmentCredits { get; set; }

    public decimal AdjustmentDebits { get; set; }

    public decimal TotalCredits { get; set; }

    public decimal TotalDebits { get; set; }

    public decimal NetLedgerMovement { get; set; }

    public int TransactionCount { get; set; }
}