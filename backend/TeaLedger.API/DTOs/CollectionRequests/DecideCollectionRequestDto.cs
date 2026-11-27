using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.CollectionRequests;

public class DecideCollectionRequestDto
{
    [Required]
    public string Decision { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Note { get; set; }
}
