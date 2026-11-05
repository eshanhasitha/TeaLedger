using TeaLedger.API.Models;

namespace TeaLedger.API.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(
        User user,
        DateTime expiresAt);

    DateTime GetExpirationTime();
}