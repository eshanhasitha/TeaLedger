namespace TeaLedger.API.Models;

public enum CollectionStatus
{
    Pending,
    Collected,
    Cancelled,
    Synced
}

public class Collection
{
    public Guid Id { get; set; }

    public Guid FarmerId { get; set; }

    public Guid? CollectorId { get; set; }

    public decimal GrossWeight { get; set; }

    public decimal WaterReduction { get; set; }

    public decimal BagWeight { get; set; }

    public decimal OtherReduction { get; set; }

    public decimal FinalWeight { get; set; }

    public decimal PricePerKg { get; set; }

    public decimal TotalAmount { get; set; }

    public CollectionStatus Status { get; set; }

    public DateTime CollectedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Farmer Farmer { get; set; } = null!;
}