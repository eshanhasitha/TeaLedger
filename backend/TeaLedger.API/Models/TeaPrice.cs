namespace TeaLedger.API.Models;

public sealed class TeaPrice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CollectorId { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public decimal PricePerKg { get; set; }

    // The date from which this monthly price applies.
    public DateTime EffectiveFrom { get; set; }

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Collector Collector { get; set; } = null!;
}