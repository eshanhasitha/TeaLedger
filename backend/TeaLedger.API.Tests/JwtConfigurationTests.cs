using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TeaLedger.API.Configuration;

namespace TeaLedger.API.Tests;

public sealed class JwtConfigurationTests
{
    private const string Key = "0123456789abcdef0123456789abcdef";

    [Theory]
    [InlineData(0)]
    [InlineData(1441)]
    public void BindJwtSettings_RejectsInvalidLifetime(int lifetime)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = Key,
                ["Jwt:Issuer"] = "TeaLedger.API",
                ["Jwt:Audience"] = "TeaLedger.Client",
                ["Jwt:ExpiresInMinutes"] = lifetime.ToString()
            })
            .Build();

        Assert.Throws<InvalidOperationException>(
            () => ApplicationConfiguration.BindJwtSettings(configuration));
    }

    [Fact]
    public void CreateTokenValidationParameters_AcceptsValidHs256Token()
    {
        var settings = CreateSettings();
        var now = DateTime.UtcNow;
        var token = CreateToken(settings, SecurityAlgorithms.HmacSha256,
            now.AddMinutes(-1), now.AddMinutes(5));

        var principal = ValidateToken(token, settings);

        Assert.Equal("farmer-user", principal.FindFirst("sub")?.Value);
        Assert.Equal("Farmer", principal.FindFirst("role")?.Value);
    }

    [Fact]
    public void CreateTokenValidationParameters_RestrictsAlgorithmsToHs256()
    {
        var settings = CreateSettings();
        settings.Key = settings.Key.PadRight(64, 'x');
        var now = DateTime.UtcNow;
        var token = CreateToken(
            settings,
            SecurityAlgorithms.HmacSha512,
            now.AddMinutes(-1),
            now.AddMinutes(5));
        var parameters =
            ApplicationConfiguration.CreateTokenValidationParameters(settings);

        Assert.Equal(
            [SecurityAlgorithms.HmacSha256],
            parameters.ValidAlgorithms);
        Assert.ThrowsAny<SecurityTokenException>(() =>
            ValidateToken(token, settings));
    }

    [Fact]
    public void CreateTokenValidationParameters_RejectsExpiredToken()
    {
        var settings = CreateSettings();
        var now = DateTime.UtcNow;
        var token = CreateToken(settings, SecurityAlgorithms.HmacSha256,
            now.AddMinutes(-10), now.AddMinutes(-2));

        Assert.Throws<SecurityTokenExpiredException>(() =>
            ValidateToken(token, settings));
    }

    [Fact]
    public void CreateTokenValidationParameters_RejectsWrongSignatureKey()
    {
        var settings = CreateSettings();
        var now = DateTime.UtcNow;
        var token = CreateToken(
            settings,
            SecurityAlgorithms.HmacSha256,
            now.AddMinutes(-1),
            now.AddMinutes(5),
            signingKey: settings.Key + "wrong");

        Assert.ThrowsAny<SecurityTokenException>(() =>
            ValidateToken(token, settings));
    }

    [Theory]
    [InlineData("wrong-issuer", "TeaLedger.Client")]
    [InlineData("TeaLedger.API", "wrong-audience")]
    public void CreateTokenValidationParameters_RejectsWrongIssuerOrAudience(
        string issuer,
        string audience)
    {
        var settings = CreateSettings();
        var now = DateTime.UtcNow;
        var token = CreateToken(
            settings,
            SecurityAlgorithms.HmacSha256,
            now.AddMinutes(-1),
            now.AddMinutes(5),
            issuer,
            audience);

        Assert.ThrowsAny<SecurityTokenException>(() =>
            ValidateToken(token, settings));
    }

    private static JwtSettings CreateSettings() => new()
    {
        Key = Key,
        Issuer = "TeaLedger.API",
        Audience = "TeaLedger.Client",
        ExpiresInMinutes = 60
    };

    private static string CreateToken(
        JwtSettings settings,
        string algorithm,
        DateTime issuedAt,
        DateTime expires,
        string? issuer = null,
        string? audience = null,
        string? signingKey = null)
    {
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                signingKey ?? settings.Key)),
            algorithm);
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = issuer ?? settings.Issuer,
            Audience = audience ?? settings.Audience,
            IssuedAt = issuedAt,
            NotBefore = issuedAt,
            Expires = expires,
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Sub, "farmer-user"),
                new Claim("role", "Farmer")
            ]),
            SigningCredentials = credentials
        };

        return new JwtSecurityTokenHandler().CreateEncodedJwt(descriptor);
    }

    private static ClaimsPrincipal ValidateToken(
        string token,
        JwtSettings settings)
    {
        var handler = new JwtSecurityTokenHandler
        {
            MapInboundClaims = false
        };
        return handler.ValidateToken(
            token,
            ApplicationConfiguration.CreateTokenValidationParameters(settings),
            out _);
    }
}
