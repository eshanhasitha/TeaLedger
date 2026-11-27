
namespace TeaLedger.API.DTOs.Farmers;

public class FarmerResponse
{
    public Guid FarmerId { get; set; }

    public Guid UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string FarmerCode { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public decimal FarmSizeHectares { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
