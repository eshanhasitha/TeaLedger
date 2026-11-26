
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.Services;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public sealed class DashboardsController : ControllerBase
{
    private readonly DashboardService _dashboard;

    public DashboardsController(DashboardService dashboard)
    {
        _dashboard = dashboard;
    }

    private Guid GetCurrentUserId()
    {
        var subject = User.FindFirst(
            JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(subject, out var userId))
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");

        return userId;
    }

    [HttpGet("farmer")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerDashboard(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            var result = await _dashboard.GetFarmerAsync(
                GetCurrentUserId(), from, to, ct);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("collector")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> CollectorDashboard(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            var result = await _dashboard.GetCollectorAsync(
                GetCurrentUserId(), from, to, ct);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
