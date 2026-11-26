using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Deductions;

public sealed class DeductionSummaryDto
{
    public DateTime From { get; set; }

    public DateTime To { get; set; }

    public int DeductionCount { get; set; }

    public decimal TotalAmount { get; set; }

    public List<DeductionCategorySummaryDto> Categories { get; set; }
        = [];
}

public sealed class DeductionCategorySummaryDto
{
    public string Category { get; set; } = string.Empty;

    public int Count { get; set; }

    public decimal TotalAmount { get; set; }
}