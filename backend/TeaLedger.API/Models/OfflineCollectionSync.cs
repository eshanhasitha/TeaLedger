
namespace TeaLedger.API.Models;

public enum OfflineSyncStatus
{
    Synced,
    Conflict,
    Rejected
}

public class OfflineCollectionSync
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Stable ID generated and stored by the collector's device.
    public Guid ClientOperationId { get; set; }

    // Authenticated collector's User.Id, never supplied by the client.
    public Guid CollectorUserId { get; set; }

    public Guid RequestId { get; set; }

    public Guid? CollectionId { get; set; }

    public OfflineSyncStatus Status { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime ClientCollectedAt { get; set; }

    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

    public DateTime? SyncedAt { get; set; }

    public User CollectorUser { get; set; } = null!;

    public CollectionRequest Request { get; set; } = null!;

    public Collection? Collection { get; set; }
}
