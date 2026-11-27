
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Collections;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/collections")]
public sealed class CollectionsController : ControllerBase
{
    private readonly ICollectionService _service;

    public CollectionsController(ICollectionService service)
    {
        _service = service;
    }

    private Guid CurrentUserId()
    {
        var value = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");
        }

        return userId;
    }

    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCollectionDto input,
        CancellationToken ct)
    {
        if (input.RequestId == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "A valid RequestId is required."
            });
        }

        if (input.CollectedAt.HasValue &&
            input.CollectedAt.Value > DateTime.UtcNow.AddMinutes(5))
        {
            return BadRequest(new
            {
                message = "CollectedAt cannot be in the future."
            });
        }

        try
        {
            var result = await _service.CreateAsync(
                CurrentUserId(),
                input,
                ct);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    [HttpGet("my-history")]
    public async Task<IActionResult> MyHistory(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        if (from.HasValue && to.HasValue && from.Value > to.Value)
        {
            return BadRequest(new
            {
                message = "The from date cannot be after the to date."
            });
        }

        var result = await _service.FarmerHistoryAsync(
            CurrentUserId(),
            from,
            to,
            ct);

        return Ok(result);
    }

    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> FarmerDetails(
        Guid id,
        CancellationToken ct)
    {
        var result = await _service.GetFarmerCollectionAsync(
            id,
            CurrentUserId(),
            ct);

        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpGet("/api/admin/collections")]
    public async Task<IActionResult> AdminList(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] Guid? farmerId,
        CancellationToken ct)
    {
        if (from.HasValue && to.HasValue && from.Value > to.Value)
        {
            return BadRequest(new
            {
                message = "The from date cannot be after the to date."
            });
        }

        if (farmerId == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "FarmerId must be a valid identifier."
            });
        }

        var result = await _service.AdminListAsync(
            from,
            to,
            farmerId,
            ct);

        return Ok(result);
    }
}
