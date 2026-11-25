
using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Settlements;

public sealed class SettlementDto
{
    public Guid Id { get; set; }

    public Guid FarmerId { get; set; }

    public string FarmerName { get; set; } = string.Empty;

    public string FarmerCode { get; set; } = string.Empty;

    public int Year { get; set; }

    public int Month { get; set; }

    public DateTime PeriodStart { get; set; }

    public DateTime PeriodEnd { get; set; }

    public decimal GrossTeaIncome { get; set; }

    public decimal TotalTeaQuantityKg { get; set; }

    public decimal AverageTeaPricePerKg { get; set; }

    public decimal MaterialDeductions { get; set; }

    public decimal TotalDeductionQuantityKg { get; set; }

    public IReadOnlyList<SettlementDeductionBreakdownDto> DeductionBreakdown { get; set; }
        = Array.Empty<SettlementDeductionBreakdownDto>();

    public decimal LoanRepayments { get; set; }

    public decimal RemainingLoanBalance { get; set; }

    public decimal NetSettlementAmount { get; set; }

    public SettlementStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? PaidAt { get; set; }
}

public sealed class SettlementDeductionBreakdownDto
{
    public string Category { get; set; } = string.Empty;

    public string Unit { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Amount { get; set; }
}
