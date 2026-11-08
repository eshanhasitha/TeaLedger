using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Deductions;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Controllers;

[ApiController]
[Authorize]
[Route("api/deductions")]
public sealed class DeductionsController : ControllerBase
{
    private readonly IDeductionService _service;

    public DeductionsController(IDeductionService service)
    {
        _service = service;
    }

    private Guid CurrentUserId()
    {
        var value = User.FindFirst(
            JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(value, out var userId))
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");

        return userId;
    }

    // Collector records a deduction against one of their farmers.
    [HttpPost("farmers/{farmerId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> Create(
        Guid farmerId,
        [FromBody] CreateDeductionDto input,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.CreateAsync(
                CurrentUserId(), farmerId, input, ct);

            return StatusCode(
                StatusCodes.Status201Created,
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
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("collector")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> CollectorHistory(
        [FromQuery] Guid? farmerId,
        [FromQuery] DeductionCategory? category,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            return Ok(await _service.GetCollectorAsync(
                CurrentUserId(), farmerId, category, from, to, ct));
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

    [HttpGet("farmer")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerHistory(
        [FromQuery] DeductionCategory? category,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            return Ok(await _service.GetFarmerAsync(
                CurrentUserId(), category, from, to, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("admin")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> AdminHistory(
        [FromQuery] Guid? farmerId,
        [FromQuery] Guid? collectorId,
        [FromQuery] DeductionCategory? category,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            return Ok(await _service.GetAdminAsync(
                farmerId, collectorId, category, from, to, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("admin/summary")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> AdminSummary(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken ct)
    {
        try
        {
            return Ok(await _service.GetAdminSummaryAsync(
                from, to, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}