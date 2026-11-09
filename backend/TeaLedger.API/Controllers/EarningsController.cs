using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/earnings")]
[Authorize]
public sealed class EarningsController : ControllerBase
{
    private readonly IEarningsService _service;

    public EarningsController(IEarningsService service)
    {
        _service = service;
    }

    private Guid GetCurrentUserId()
    {
        var subject = User.FindFirst(
            JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(subject, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");
        }

        return userId;
    }

    // GET api/earnings/farmer/daily?date=2026-11-02
    [HttpGet("farmer/daily")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerDaily(
        [FromQuery] DateOnly date,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetDailyEarningsAsync(
                GetCurrentUserId(), date, ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET api/earnings/farmer/monthly?year=2026&month=11
    [HttpGet("farmer/monthly")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerMonthly(
        [FromQuery] int year,
        [FromQuery] int month,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetMonthlyEarningsAsync(
                GetCurrentUserId(), year, month, ct);

            return Ok(result);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET api/earnings/farmer/collections?from=2026-11-01&to=2026-11-30
    [HttpGet("farmer/collections")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerCollections(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetCollectionEarningsAsync(
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

    // GET api/earnings/farmer/ledger
    [HttpGet("farmer/ledger")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerLedger(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetFarmerLedgerAsync(
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

    // GET api/earnings/farmer/financial-summary
//     ?from=2026-11-01&to=2026-11-30

[HttpGet("farmer/financial-summary")]
[Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
public async Task<IActionResult> FarmerFinancialSummary(
    [FromQuery] DateOnly from,
    [FromQuery] DateOnly to,
    CancellationToken ct)
{
    try
    {
        var result =
            await _service.GetFarmerFinancialSummaryAsync(
                GetCurrentUserId(),
                from,
                to,
                ct);

        return Ok(result);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
    catch (UnauthorizedAccessException)
    {
        return Forbid();
    }
}

    // GET api/earnings/collector/summary?from=2026-11-01&to=2026-11-30
    [HttpGet("collector/summary")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> CollectorSummary(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetCollectorEarningsAsync(
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

    // GET api/earnings/admin/summary?from=2026-11-01&to=2026-11-30
    [HttpGet("admin/summary")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> AdminSummary(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetAdminEarningsAsync(
                from, to, ct);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET api/earnings/admin/reconciliation?from=...&to=...
    [HttpGet("admin/reconciliation")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> Reconciliation(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.ReconcileAsync(
                from, to, ct);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}