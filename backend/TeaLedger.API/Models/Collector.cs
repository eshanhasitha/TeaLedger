namespace TeaLedger.API.Models;

public class Collector
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string CollectorCode { get; set; } = string.Empty;

    public string? Area { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}