
using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Notifications;

public sealed class RegisterDeviceTokenDto
{
    [Required]
    [StringLength(4096, MinimumLength = 20)]
    public string Token { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(android|ios|web)$")]
    public string Platform { get; set; } = string.Empty;
}