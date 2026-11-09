namespace TeaLedger.API.Configuration;

public sealed class JwtSettings
{
    public string Key { get; set; } = string.Empty;

    public string Issuer { get; set; } = "TeaLedger.API";

    public string Audience { get; set; } = "TeaLedger.Client";

    public int ExpiresInMinutes { get; set; } = 60;
}