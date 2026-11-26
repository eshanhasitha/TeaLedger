namespace TeaLedger.API.Models;

public enum DeductionCategory
{
    Fertilizer = 1,
    Dolomite = 2,
    TeaBags = 3,
    Transport = 4,
    Other = 5
}

public sealed class Deduction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FarmerId { get; set; }

    public Guid CollectorId { get; set; }

    public DeductionCategory Category { get; set; }

    public string Description { get; set; } = string.Empty;

    // Examples: kg, bag, packet, trip.
    public decimal Quantity { get; set; }

    public string Unit { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public decimal Amount { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public Guid CreatedByUserId { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Farmer Farmer { get; set; } = null!;

    public Collector Collector { get; set; } = null!;

    public FinancialLedgerEntry LedgerEntry { get; set; } = null!;
}