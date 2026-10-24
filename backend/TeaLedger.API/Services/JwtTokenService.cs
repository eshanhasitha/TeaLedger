using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TeaLedger.API.Configuration;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class JwtService : IJwtTokenService
{
    private readonly JwtSettings _settings;

    public JwtService(JwtSettings settings)
    {
        _settings = settings;

        if (string.IsNullOrWhiteSpace(_settings.Key))
        {
            throw new InvalidOperationException(
                "JWT signing key is not configured.");
        }

        if (_settings.Key.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT signing key must contain at least 32 characters.");
        }

        if (string.IsNullOrWhiteSpace(_settings.Issuer))
        {
            throw new InvalidOperationException(
                "JWT issuer is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_settings.Audience))
        {
            throw new InvalidOperationException(
                "JWT audience is not configured.");
        }
    }

    public DateTime GetExpirationTime()
    {
        return DateTime.UtcNow.AddMinutes(
            _settings.ExpiresInMinutes);
    }

    public string GenerateToken(
        User user,
        DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()),

            new(
                JwtRegisteredClaimNames.Name,
                user.FullName),

            new(
                "phone_number",
                user.PhoneNumber),

            new(
                "role",
                user.Role.ToString())
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_settings.Key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var utcExpiresAt = expiresAt.Kind switch
        {
            DateTimeKind.Utc => expiresAt,
            DateTimeKind.Local => expiresAt.ToUniversalTime(),
            _ => DateTime.SpecifyKind(expiresAt, DateTimeKind.Utc)
        };

        if (utcExpiresAt <= DateTime.UtcNow)
        {
            throw new ArgumentOutOfRangeException(
                nameof(expiresAt),
                "JWT expiration must be in the future.");
        }

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: utcExpiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}
