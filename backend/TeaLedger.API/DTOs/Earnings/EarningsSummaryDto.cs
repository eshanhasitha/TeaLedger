namespace TeaLedger.API.DTOs.Earnings;

public sealed class EarningsSummaryDto
{
    public DateTime From { get; set; }

    public DateTime To { get; set; }

    public int CollectionCount { get; set; }

    public decimal TotalWeightKg { get; set; }

    public decimal TotalEarnings { get; set; }

    public decimal AveragePricePerKg { get; set; }

    public List<DailyEarningDto> DailyBreakdown { get; set; } = [];
}

public sealed class DailyEarningDto
{
    public DateTime Date { get; set; }

    public int CollectionCount { get; set; }

    public decimal TotalWeightKg { get; set; }

    public decimal TotalEarnings { get; set; }
}