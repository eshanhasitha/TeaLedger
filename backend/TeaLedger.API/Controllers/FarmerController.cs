using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/farmer")]
[Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
public sealed class FarmerController : ControllerBase
{
    [HttpGet("dashboard")]
    public IActionResult GetDashboard()
    {
        return Ok(new { message = "Farmer access granted." });
    }
}
