namespace TeaLedger.API.Models;

public class PassbookEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CollectionId { get; set; }

    public Collection Collection { get; set; } = null!;
}
