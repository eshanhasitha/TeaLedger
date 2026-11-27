
namespace TeaLedger.API.DTOs.Settlements;

public sealed class SettlementSummaryDto
{
    public int Year { get; set; }

    public int Month { get; set; }

    public int SettlementCount { get; set; }

    public decimal TotalGrossTeaIncome { get; set; }

    public decimal TotalMaterialDeductions { get; set; }

    public decimal TotalLoanRepayments { get; set; }

    public decimal TotalNetSettlementAmount { get; set; }
}
