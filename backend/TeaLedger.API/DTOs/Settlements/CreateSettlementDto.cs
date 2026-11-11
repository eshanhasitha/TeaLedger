
using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Settlements;

public sealed class CreateSettlementDto
{
    [Required]
    public Guid FarmerId { get; set; }

    [Range(2020, 2100)]
    public int Year { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    [Range(typeof(decimal), "0", "1000000000")]
    public decimal LoanRepaymentAmount { get; set; }
}
