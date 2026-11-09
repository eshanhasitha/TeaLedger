using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Deductions;

public sealed class DeductionDto
{
    public Guid Id { get; set; }

    public Guid FarmerId { get; set; }

    public string FarmerName { get; set; } = string.Empty;

    public string FarmerCode { get; set; } = string.Empty;

    public Guid CollectorId { get; set; }

    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public string Unit { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public decimal Amount { get; set; }

    public DateTime OccurredAt { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
}