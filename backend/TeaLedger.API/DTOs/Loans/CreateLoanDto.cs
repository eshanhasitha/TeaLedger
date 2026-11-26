using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Loans;

public sealed class CreateLoanDto
{
    [Range(typeof(decimal), "0.01", "1000000000")]
    public decimal PrincipalAmount { get; set; }

    public DateTime? IssuedAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}