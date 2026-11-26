using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Collections;

public class VerifyWeightDto
{
    [Range(typeof(decimal), "0.001", "1000000")]
    public decimal GrossWeight { get; set; }

    [Range(typeof(decimal), "0", "1000000")]
    public decimal WaterReduction { get; set; }

    [Range(typeof(decimal), "0", "1000000")]
    public decimal BagWeight { get; set; }

    [Range(typeof(decimal), "0", "1000000")]
    public decimal OtherReduction { get; set; }
}