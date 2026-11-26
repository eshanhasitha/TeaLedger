using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.CollectionRequests;

public class CollectionRequestDto
{
    public Guid Id { get; set; }

    public Guid FarmerId { get; set; }

    public string FarmerName { get; set; } = string.Empty;

    public string FarmerCode { get; set; } = string.Empty;

    public decimal EstimatedQuantityKg { get; set; }

    public CollectionRequestStatus Status { get; set; }

    public DateTime RequestedAt { get; set; }

    public DateTime? RespondedAt { get; set; }

    public string? CollectorNote { get; set; }
}
