namespace TeaLedger.API.DTOs.Earnings;

public sealed class CollectionEarningDto
{
    public Guid CollectionId { get; set; }

    public DateTime CollectedAt { get; set; }

    public decimal FinalWeightKg { get; set; }

    public decimal PricePerKg { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; } = string.Empty;
}