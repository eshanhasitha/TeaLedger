using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Auth;

public sealed class LoginRequest
{
    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}