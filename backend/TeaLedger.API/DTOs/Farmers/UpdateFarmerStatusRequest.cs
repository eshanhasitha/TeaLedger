using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Farmers;

public class UpdateFarmerStatusRequest
{
    public bool IsActive { get; set; }
}
