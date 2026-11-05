namespace TeaLedger.API.DTOs.Collectors;

public sealed class CollectorDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string CollectorCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string? Address { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}