using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/collector")]
[Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
public sealed class CollectorController : ControllerBase
{
    [HttpGet("dashboard")]
    public IActionResult GetDashboard()
    {
        return Ok(new { message = "Collector access granted." });
    }
}
