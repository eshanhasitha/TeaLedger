
using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Sync;

public class OfflineCollectionSyncDto
{
    [Required]
    public Guid ClientOperationId { get; set; }

    [Required]
    public Guid RequestId { get; set; }

    [Required]
    public DateTime CollectedAt { get; set; }
}
