using TeaLedger.API.DTOs.Auth;

namespace TeaLedger.API.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);
}