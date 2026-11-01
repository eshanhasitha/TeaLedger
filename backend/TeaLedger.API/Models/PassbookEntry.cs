namespace TeaLedger.API.Models;

public class PassbookEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FarmerId { get; set; }

    public Guid CollectionId { get; set; }

    public decimal GrossWeight { get; set; }

    public decimal TotalReduction { get; set; }

    public decimal FinalWeight { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    public Farmer Farmer { get; set; } = null!;

    public Collection Collection { get; set; } = null!;
}