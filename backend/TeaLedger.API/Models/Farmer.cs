namespace TeaLedger.API.Models;

public class Farmer
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string FarmerCode { get; set; } = string.Empty;

    public string? Address { get; set; }

    public decimal? TeaLandSize { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}