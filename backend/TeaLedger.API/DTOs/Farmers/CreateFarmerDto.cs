
using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Farmers;

public class CreateFarmerRequest
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [StringLength(30, MinimumLength = 3)]
    public string FarmerCode { get; set; } = string.Empty;

    [Required]
    [StringLength(250, MinimumLength = 5)]
    public string Address { get; set; } = string.Empty;

    [Range(0.01, 100000)]
    public decimal FarmSizeHectares { get; set; }
}
