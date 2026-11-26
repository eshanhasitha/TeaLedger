namespace TeaLedger.API.DTOs.Users;

public sealed class UpdateUserStatusRequest
{
    public bool IsActive { get; init; }
}