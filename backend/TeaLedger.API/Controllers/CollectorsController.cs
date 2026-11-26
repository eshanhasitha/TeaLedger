using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Collectors;
using TeaLedger.API.Interfaces;
using System.Security.Claims;
namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/admin/collectors")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public sealed class CollectorsController : ControllerBase
{
    private readonly ICollectorService _service;
    private readonly IActivityLogService _activityLogService;

    public CollectorsController(
        ICollectorService service,
        IActivityLogService activityLogService)
    {
        _service = service;
        _activityLogService = activityLogService;
    }

    private Guid? GetActorUserId()
    {
        var value = User.FindFirstValue("sub");

        return Guid.TryParse(value, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? area = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new
            {
                message = "Invalid pagination parameters."
            });
        }

        var result = await _service.SearchCollectorsAsync(
            page,
            pageSize,
            search,
            area,
            isActive,
            cancellationToken);

        return Ok(new
        {
            items = result.Items,
            page,
            pageSize,
            totalCount = result.TotalCount,
            totalPages = (int)Math.Ceiling(
                result.TotalCount / (double)pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var collector = await _service.GetCollectorByIdAsync(
            id, cancellationToken);

        return collector is null
            ? NotFound(new { message = "Collector not found." })
            : Ok(collector);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCollectorDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var collector = await _service.CreateCollectorAsync(
                request, cancellationToken);

            await _activityLogService.RecordAsync(
                GetActorUserId(),
                "COLLECTOR_CREATED",
                "Collector",
                collector.Id,
                "Admin created a collector account.",
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = collector.Id },
                collector);
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCollectorDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var collector = await _service.UpdateCollectorAsync(
                id, request, cancellationToken);

            if (collector is null)
                return NotFound(new { message = "Collector not found." });

            await _activityLogService.RecordAsync(
                GetActorUserId(),
                "COLLECTOR_UPDATED",
                "Collector",
                id,
                "Admin updated collector profile.",
                cancellationToken);

            return Ok(collector);
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

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateCollectorStatusDto request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.SetCollectorStatusAsync(
            id, request.IsActive, cancellationToken);

        if (!updated)
        {
            return NotFound(new { message = "Collector not found." });
        }

        await _activityLogService.RecordAsync(
            GetActorUserId(),
            request.IsActive
                ? "COLLECTOR_ACTIVATED"
                : "COLLECTOR_DEACTIVATED",
            "Collector",
            id,
            "Admin changed collector account status.",
            cancellationToken);

        return Ok(new
        {
            collectorId = id,
            isActive = request.IsActive,
            message = request.IsActive
                ? "Collector activated."
                : "Collector deactivated."
        });
    }
    
}
