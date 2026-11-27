namespace TeaLedger.API.Models;

public enum LoanStatus
{
    Active = 1,
    Closed = 2,
    Cancelled = 3
}

public sealed class Loan
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FarmerId { get; set; }

    public Guid CollectorId { get; set; }

    public decimal PrincipalAmount { get; set; }

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public LoanStatus Status { get; set; } = LoanStatus.Active;

    public string? Notes { get; set; }

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Farmer Farmer { get; set; } = null!;

    public Collector Collector { get; set; } = null!;

    public ICollection<LoanRepayment> Repayments { get; set; }
        = new List<LoanRepayment>();
}