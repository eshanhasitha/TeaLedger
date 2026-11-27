using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Collections;

public class CollectionDto
{
    public Guid Id { get; set; }
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerCode { get; set; } = string.Empty;
    public Guid RequestId { get; set; }
    public Guid? CollectorId { get; set; }
    public decimal GrossWeight { get; set; }
    public decimal WaterReduction { get; set; }
    public decimal BagWeight { get; set; }
    public decimal OtherReduction { get; set; }
    public decimal FinalWeight { get; set; }
    public decimal PricePerKg { get; set; }
    public decimal TotalAmount { get; set; }
    public CollectionStatus Status { get; set; }
    public DateTime CollectedAt { get; set; }
}
