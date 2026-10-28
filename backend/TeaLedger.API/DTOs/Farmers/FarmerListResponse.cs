
namespace TeaLedger.API.DTOs.Farmers;

public class FarmerListResponse
{
    public IReadOnlyList<FarmerResponse> Items { get; set; }
        = Array.Empty<FarmerResponse>();

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}
