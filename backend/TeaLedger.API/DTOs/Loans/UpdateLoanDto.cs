using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Loans;

public sealed class UpdateLoanDto
{
    [MaxLength(500)]
    public string? Notes { get; set; }
}