
namespace TeaLedger.API.DTOs.Farmers;

public sealed class FarmerProfileDto
{
    public Guid Id { get; set; }
    public string FarmerCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public decimal? TeaLandSize { get; set; }
    public bool IsActive { get; set; }
}
