namespace TeaLedger.API.DTOs.Earnings;

public sealed class AdminEarningsSummaryDto
{
    public DateTime From { get; set; }

    public DateTime To { get; set; }

    public int CollectionCount { get; set; }

    public int FarmerCount { get; set; }

    public int CollectorCount { get; set; }

    public decimal TotalWeightKg { get; set; }

    public decimal TotalEarnings { get; set; }

    public List<DailyEarningDto> DailyBreakdown { get; set; } = [];

    public List<CollectorEarningsDto> CollectorBreakdown { get; set; } = [];
}

public sealed class CollectorEarningsDto
{
    public Guid CollectorId { get; set; }

    public string CollectorName { get; set; } = string.Empty;

    public int CollectionCount { get; set; }

    public decimal TotalWeightKg { get; set; }

    public decimal TotalEarnings { get; set; }
}