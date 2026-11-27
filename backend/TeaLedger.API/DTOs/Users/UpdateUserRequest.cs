using System.ComponentModel.DataAnnotations;

namespace TeaLedger.API.DTOs.Users;

public sealed class UpdateUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; init; } = string.Empty;

    [Required]
    [Phone]
    [StringLength(20)]
    public string PhoneNumber { get; init; } = string.Empty;
}