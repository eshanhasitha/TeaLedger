using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Loans;

public sealed class LoanDto
{
    public Guid Id { get; set; }

    public Guid FarmerId { get; set; }

    public string FarmerName { get; set; } = string.Empty;

    public string FarmerCode { get; set; } = string.Empty;

    public Guid CollectorId { get; set; }

    public decimal PrincipalAmount { get; set; }

    public decimal TotalRepaid { get; set; }

    public decimal OutstandingBalance { get; set; }

    public DateTime IssuedAt { get; set; }

    public LoanStatus Status { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<LoanRepaymentDto> Repayments { get; set; } = [];
}