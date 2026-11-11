
namespace TeaLedger.API.DTOs.Settlements;

public sealed class SettlementFilterDto
{
    public int? Year { get; set; }

    public int? Month { get; set; }

    public string? Status { get; set; }
}
