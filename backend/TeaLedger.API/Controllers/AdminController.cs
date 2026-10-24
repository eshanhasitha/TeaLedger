using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public sealed class AdminController : ControllerBase
{
    [HttpGet("dashboard")]
    public IActionResult GetDashboard()
    {
        return Ok(new { message = "Admin access granted." });
    }
}
