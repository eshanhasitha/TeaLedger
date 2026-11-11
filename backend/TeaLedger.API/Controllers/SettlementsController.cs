
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Settlements;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/settlements")]
[Authorize]
public sealed class SettlementsController : ControllerBase
{
    private readonly ISettlementService _service;

    public SettlementsController(ISettlementService service)
    {
        _service = service;
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

    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> Create(
        [FromBody] CreateSettlementDto input,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.CreateAsync(
                GetCurrentUserId(), input, ct);

            return CreatedAtAction(
                nameof(AdminList),
                new { id = result.Id },
                result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("admin")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> AdminList(
        [FromQuery] int? year,
        [FromQuery] int? month,
        [FromQuery] string? status,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetAdminSettlementsAsync(
                year, month, status, ct);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{settlementId:guid}/pay")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> MarkPaid(
        Guid settlementId,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.MarkPaidAsync(
                GetCurrentUserId(), settlementId, ct);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("farmer")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerList(
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetFarmerSettlementsAsync(
                GetCurrentUserId(), ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("farmer/{settlementId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerDetails(
        Guid settlementId,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetFarmerSettlementAsync(
                GetCurrentUserId(), settlementId, ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("collector")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> CollectorList(
        CancellationToken ct)
    {
        try
        {
            var result =
                await _service.GetCollectorSettlementsAsync(
                    GetCurrentUserId(), ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
