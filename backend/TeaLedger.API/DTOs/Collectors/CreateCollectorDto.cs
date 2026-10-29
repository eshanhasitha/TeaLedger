using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Collectors;

public sealed class CreateCollectorDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [Phone]
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [StringLength(300)]
    public string? Address { get; set; }
}