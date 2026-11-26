using System.ComponentModel.DataAnnotations;
using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Deductions;

public sealed class CreateDeductionDto
{
    [EnumDataType(typeof(DeductionCategory))]
    public DeductionCategory Category { get; set; }

    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Description { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.001", "100000000")]
    public decimal Quantity { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 1)]
    public string Unit { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "100000000")]
    public decimal UnitPrice { get; set; }

    public DateTime? OccurredAt { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}