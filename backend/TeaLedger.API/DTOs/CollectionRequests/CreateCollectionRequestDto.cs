using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.CollectionRequests;

public class CreateCollectionRequestDto
{
    [Range(typeof(decimal), "0.01", "10000")]
    public decimal EstimatedQuantityKg { get; set; }
}
