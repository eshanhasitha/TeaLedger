using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Collections;

public class CreateCollectionDto
{
    [Required]
    public Guid RequestId { get; set; }

    public DateTime? CollectedAt { get; set; }
}
