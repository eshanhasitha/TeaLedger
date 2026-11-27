using Microsoft.AspNetCore.Authorization;

namespace TeaLedger.API.Authorization;

public static class AuthorizationPolicies
{
    public const string AdminOnly = "AdminOnly";

    public const string CollectorOnly = "CollectorOnly";

    public const string FarmerOnly = "FarmerOnly";

    public static void Configure(AuthorizationOptions options)
    {
        options.AddPolicy(
            AdminOnly,
            policy => policy.RequireRole("Admin"));
        options.AddPolicy(
            CollectorOnly,
            policy => policy.RequireRole("Collector"));
        options.AddPolicy(
            FarmerOnly,
            policy => policy.RequireRole("Farmer"));
    }
}
