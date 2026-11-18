using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using TeaLedger.API.Authorization;

namespace TeaLedger.API.Tests;

public sealed class AuthorizationPolicyTests
{
    [Theory]
    [InlineData(AuthorizationPolicies.AdminOnly, "Admin")]
    [InlineData(AuthorizationPolicies.CollectorOnly, "Collector")]
    [InlineData(AuthorizationPolicies.FarmerOnly, "Farmer")]
    public void RolePolicy_RequiresExpectedRole(
        string policyName,
        string expectedRole)
    {
        var options = new AuthorizationOptions();
        AuthorizationPolicies.Configure(options);

        var policy = options.GetPolicy(policyName);
        Assert.NotNull(policy);
        var roleRequirement = Assert.Single(
            policy.Requirements.OfType<RolesAuthorizationRequirement>());
        Assert.Equal([expectedRole], roleRequirement.AllowedRoles);
    }
}
