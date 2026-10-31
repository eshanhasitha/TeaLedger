
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Farmers;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/collector/farmers")]
[Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
public sealed class CollectorFarmersController : ControllerBase
{
    private readonly IFarmerService _farmerService;

    public CollectorFarmersController(IFarmerService farmerService)
    {
        _farmerService = farmerService;
    }

    private Guid? GetCurrentUserId()
    {
        var value = User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<ActionResult<FarmerListResponse>> GetFarmers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        try
        {
            var result = await _farmerService.GetCollectorFarmersAsync(
                userId.Value,
                page,
                pageSize,
                search,
                isActive,
                cancellationToken);

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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetFarmer(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        try
        {
            var farmer =
                await _farmerService.GetCollectorFarmerByIdAsync(
                    userId.Value, id, cancellationToken);

            return farmer is null
                ? NotFound(new { message = "Farmer not found." })
                : Ok(farmer);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateFarmer(
        [FromBody] CreateFarmerRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        try
        {
            var farmer =
                await _farmerService.CreateCollectorFarmerAsync(
                    userId.Value, request, cancellationToken);

            return CreatedAtAction(
                nameof(GetFarmer),
                new { id = farmer.FarmerId },
                farmer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateFarmer(
        Guid id,
        [FromBody] UpdateFarmerRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        try
        {
            var farmer =
                await _farmerService.UpdateCollectorFarmerAsync(
                    userId.Value, id, request, cancellationToken);

            return farmer is null
                ? NotFound(new { message = "Farmer not found." })
                : Ok(farmer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
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

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateFarmerStatusRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
            return Unauthorized();

        try
        {
            var updated =
                await _farmerService.SetCollectorFarmerStatusAsync(
                    userId.Value,
                    id,
                    request.IsActive,
                    cancellationToken);

            return updated
                ? Ok(new
                {
                    farmerId = id,
                    isActive = request.IsActive,
                    message = request.IsActive
                        ? "Farmer activated successfully."
                        : "Farmer deactivated successfully."
                })
                : NotFound(new { message = "Farmer not found." });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
