
namespace TeaLedger.API.DTOs.Collectors;

public sealed class CollectorProfileDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string CollectorCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string? Area { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int AssignedFarmerCount { get; set; }
}
