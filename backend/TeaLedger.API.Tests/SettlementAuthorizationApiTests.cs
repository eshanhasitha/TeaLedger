using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TeaLedger.API.Data.Seeds;

namespace TeaLedger.API.Tests;

public sealed class SettlementAuthorizationApiTests
    : IClassFixture<SettlementAuthorizationApiFactory>
{
    private readonly SettlementAuthorizationApiFactory _factory;

    public SettlementAuthorizationApiTests(
        SettlementAuthorizationApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AdminSettlements_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/settlements/admin");

        Assert.Equal(
            System.Net.HttpStatusCode.Unauthorized,
            response.StatusCode);
    }

    [Fact]
    public async Task AdminSettlements_AuthenticatedAsFarmer_ReturnsForbidden()
    {
        using var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-Role", "Farmer");

        var response = await client.GetAsync("/api/settlements/admin");

        Assert.Equal(
            System.Net.HttpStatusCode.Forbidden,
            response.StatusCode);
    }
}

public sealed class SettlementAuthorizationApiFactory
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) =>
            configuration.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Cors:AllowedOrigins:0"] = "http://localhost"
                }));
        builder.ConfigureTestServices(services =>
        {
            var seedHostedService = services.SingleOrDefault(descriptor =>
                descriptor.ServiceType == typeof(IHostedService) &&
                descriptor.ImplementationType ==
                    typeof(DatabaseSeedHostedService));
            if (seedHostedService is not null)
                services.Remove(seedHostedService);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
            }).AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>(
                "Test",
                _ => { });
        });
    }
}

public sealed class TestAuthenticationHandler
    : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-Test-Role", out var role) ||
            string.IsNullOrWhiteSpace(role))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, role.ToString())
        };
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
