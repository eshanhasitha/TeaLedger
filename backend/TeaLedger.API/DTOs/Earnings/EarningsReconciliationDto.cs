namespace TeaLedger.API.DTOs.Earnings;

public sealed class EarningsReconciliationDto
{
    public DateTime From { get; set; }

    public DateTime To { get; set; }

    public decimal CollectionTotal { get; set; }

    public decimal LedgerCreditTotal { get; set; }

    public decimal Difference { get; set; }

    public int CollectionsWithoutLedgerEntry { get; set; }

    public bool IsBalanced { get; set; }
}