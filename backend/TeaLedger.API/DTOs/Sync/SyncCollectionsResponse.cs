
namespace TeaLedger.API.DTOs.Sync;

public class SyncCollectionsResponse
{
    public int Total { get; set; }

    public int Synced { get; set; }

    public int Conflicts { get; set; }

    public int Rejected { get; set; }

    public List<OfflineCollectionSyncResultDto> Results { get; set; } = [];
}

public class OfflineCollectionSyncResultDto
{
    public Guid ClientOperationId { get; set; }

    public Guid RequestId { get; set; }

    public Guid? CollectionId { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Message { get; set; }

    public bool WasPreviouslySynced { get; set; }
}
