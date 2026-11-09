namespace TeaLedger.API.Authorization;

public static class AuthorizationPolicies
{
    public const string AdminOnly = "AdminOnly";

    public const string CollectorOnly = "CollectorOnly";

    public const string FarmerOnly = "FarmerOnly";
}