namespace TeaLedger.API.DTOs.TeaPrices;

public sealed class TeaPriceDto
{
    public Guid Id { get; set; }

    public Guid CollectorId { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public decimal PricePerKg { get; set; }

    public DateTime EffectiveFrom { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}