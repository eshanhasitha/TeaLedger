using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.TeaPrices;

public sealed class SetMonthlyTeaPriceDto
{
    [Range(2020, 2100)]
    public int Year { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal PricePerKg { get; set; }

    [Required]
    public DateTime EffectiveFrom { get; set; }
}