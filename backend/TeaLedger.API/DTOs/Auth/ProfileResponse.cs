namespace TeaLedger.API.DTOs.Auth;

public sealed class ProfileResponse
{
    public Guid UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public Guid? FarmerId { get; set; }

    public string? FarmerCode { get; set; }

    public Guid? CollectorId { get; set; }

    public string? CollectorCode { get; set; }
}