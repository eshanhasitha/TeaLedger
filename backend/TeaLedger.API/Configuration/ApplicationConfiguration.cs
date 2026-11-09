namespace TeaLedger.API.Configuration;

public static class ApplicationConfiguration
{
    public static void LoadEnvironmentFile()
    {
        var searchRoots = new[]
        {
            Directory.GetCurrentDirectory(),
            AppContext.BaseDirectory
        };

        var candidateDirectories = searchRoots
            .SelectMany(Ancestors)
            .Distinct(StringComparer.OrdinalIgnoreCase);

        var envFile = candidateDirectories
            .SelectMany(directory => new[]
            {
                Path.Combine(directory, ".env"),
                Path.Combine(directory, "backend", "TeaLedger.API", ".env")
            })
            .FirstOrDefault(File.Exists);

        if (envFile is not null)
        {
            DotNetEnv.Env.Load(envFile);
        }
    }

    private static IEnumerable<string> Ancestors(string directory)
    {
        var current = new DirectoryInfo(directory);
        while (current is not null)
        {
            yield return current.FullName;
            current = current.Parent;
        }
    }

    public static JwtSettings BindJwtSettings(IConfiguration configuration)
    {
        var jwtSettings = new JwtSettings();
        configuration.GetSection("Jwt").Bind(jwtSettings);

        Require(!string.IsNullOrWhiteSpace(jwtSettings.Key),
            "JWT secret is missing. Set JWT__Secret or JWT__Key in the environment or .env file.");
        Require(jwtSettings.Key.Length >= 32,
            "JWT signing key must contain at least 32 characters.");
        Require(!string.IsNullOrWhiteSpace(jwtSettings.Issuer),
            "JWT issuer is not configured.");
        Require(!string.IsNullOrWhiteSpace(jwtSettings.Audience),
            "JWT audience is not configured.");
        Require(jwtSettings.ExpiresInMinutes > 0,
            "JWT ExpiresInMinutes must be greater than zero.");

        return jwtSettings;
    }

    private static void Require(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException(message);
        }
    }
}
