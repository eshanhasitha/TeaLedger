namespace TeaLedger.API.DTOs.Passbook;

public class PassbookEntryDto
{
    public Guid Id { get; set; }

    public Guid CollectionId { get; set; }

    public decimal GrossWeight { get; set; }

    public decimal TotalReduction { get; set; }

    public decimal FinalWeight { get; set; }

    public DateTime RecordedAt { get; set; }
}