
using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Sync;

public class SyncCollectionsRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(100)]
    public List<OfflineCollectionSyncDto> Collections { get; set; } = [];
}
