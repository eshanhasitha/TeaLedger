using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TeaLedger.API.Models;

namespace TeaLedger.API.DTOs.Loans;

public sealed class CreateLoanRepaymentDto
{
    [Range(typeof(decimal), "0.01", "1000000000")]
    public decimal Amount { get; set; }

    [EnumDataType(typeof(LoanRepaymentMethod))]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public LoanRepaymentMethod PaymentMethod { get; set; } =
        LoanRepaymentMethod.Cash;

    public DateTime? PaidAt { get; set; }

    [MaxLength(100)]
    public string? Reference { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public sealed class LoanRepaymentDto
{
    public Guid Id { get; set; }

    public Guid LoanId { get; set; }

    public decimal Amount { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public LoanRepaymentMethod PaymentMethod { get; set; }

    public DateTime PaidAt { get; set; }

    public Guid RecordedByUserId { get; set; }

    public string? Reference { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
}
