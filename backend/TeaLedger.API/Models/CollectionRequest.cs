namespace TeaLedger.API.Models;

public enum CollectionRequestStatus
{
    Pending,
    Accepted,
    Rejected,
    Cancelled,
    NotCollected,
    Collected
}

public class CollectionRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FarmerId { get; set; }

    public decimal EstimatedQuantityKg { get; set; }

    public CollectionRequestStatus Status { get; set; }
        = CollectionRequestStatus.Pending;

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RespondedAt { get; set; }

    public string? CollectorNote { get; set; }

    public Farmer Farmer { get; set; } = null!;

    public Collection? Collection { get; set; }
}