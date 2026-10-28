
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.DTOs.Farmers;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/admin/farmers")]
[Authorize(Policy = "AdminOnly")]
public class FarmersController : ControllerBase
{
    private readonly IFarmerService _farmerService;

    public FarmersController(IFarmerService farmerService)
    {
        _farmerService = farmerService;
    }

    // GET: /api/admin/farmers?page=1&pageSize=10
    // Optional filters: search, isActive
    [HttpGet]
    public async Task<ActionResult<FarmerListResponse>> GetFarmers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _farmerService.GetFarmersAsync(
            page,
            pageSize,
            search,
            isActive,
            cancellationToken);

        return Ok(result);
    }

    // GET: /api/admin/farmers/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FarmerResponse>> GetFarmer(
        Guid id,
        CancellationToken cancellationToken)
    {
        var farmer = await _farmerService.GetFarmerByIdAsync(
            id,
            cancellationToken);

        if (farmer is null)
        {
            return NotFound(new
            {
                message = "Farmer not found."
            });
        }

        return Ok(farmer);
    }

    // POST: /api/admin/farmers
    [HttpPost]
    public async Task<ActionResult<FarmerResponse>> CreateFarmer(
        [FromBody] CreateFarmerRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var farmer = await _farmerService.CreateFarmerAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetFarmer),
                new { id = farmer.FarmerId },
                farmer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // PUT: /api/admin/farmers/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FarmerResponse>> UpdateFarmer(
        Guid id,
        [FromBody] UpdateFarmerRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var farmer = await _farmerService.UpdateFarmerAsync(
                id,
                request,
                cancellationToken);

            if (farmer is null)
            {
                return NotFound(new
                {
                    message = "Farmer not found."
                });
            }

            return Ok(farmer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // PATCH: /api/admin/farmers/{id}/status
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> SetFarmerStatus(
        Guid id,
        [FromBody] UpdateFarmerStatusRequest request,
        CancellationToken cancellationToken)
    {
        bool updated = await _farmerService.SetFarmerStatusAsync(
            id,
            request.IsActive,
            cancellationToken);

        if (!updated)
        {
            return NotFound(new
            {
                message = "Farmer not found."
            });
        }

        return Ok(new
        {
            message = request.IsActive
                ? "Farmer activated successfully."
                : "Farmer deactivated successfully."
        });
    }
}
