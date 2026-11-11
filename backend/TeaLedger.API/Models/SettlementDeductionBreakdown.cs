namespace TeaLedger.API.Models;

public sealed class SettlementDeductionBreakdown
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SettlementId { get; set; }

    public DeductionCategory Category { get; set; }

    public string Unit { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Amount { get; set; }

    public Settlement Settlement { get; set; } = null!;
}
