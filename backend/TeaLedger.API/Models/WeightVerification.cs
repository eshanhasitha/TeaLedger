namespace TeaLedger.API.Models;

public class WeightVerification
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CollectionId { get; set; }

    public Guid VerifiedByCollectorId { get; set; }

    public decimal GrossWeight { get; set; }

    public decimal WaterReduction { get; set; }

    public decimal BagWeight { get; set; }

    public decimal OtherReduction { get; set; }

    public decimal FinalWeight { get; set; }

    public DateTime VerifiedAt { get; set; } = DateTime.UtcNow;

    public Collector VerifiedByCollector { get; set; } = null!;

    public Collection Collection { get; set; } = null!;
}