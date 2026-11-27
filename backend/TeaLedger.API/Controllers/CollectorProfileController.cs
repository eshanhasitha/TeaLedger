
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Collectors;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/collector/profile")]
[Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
public sealed class CollectorProfileController : ControllerBase
{
    private readonly ICollectorService _service;
    private readonly IActivityLogService _activityLogService;

    public CollectorProfileController(
        ICollectorService service,
        IActivityLogService activityLogService)
    {
        _service = service;
        _activityLogService = activityLogService;
    }

    private Guid? GetUserId()
    {
        var value = User.FindFirstValue("sub");

        return Guid.TryParse(value, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyProfile(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId is null)
            return Unauthorized();

        var profile = await _service.GetMyProfileAsync(
            userId.Value, cancellationToken);

        return profile is null
            ? NotFound(new { message = "Collector profile not found." })
            : Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateCollectorDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId is null)
            return Unauthorized();

        try
        {
            var profile = await _service.UpdateMyProfileAsync(
                userId.Value, request, cancellationToken);

            if (profile is null)
                return NotFound(new { message = "Collector profile not found." });

            await _activityLogService.RecordAsync(
                userId.Value,
                "COLLECTOR_PROFILE_UPDATED",
                "Collector",
                profile.Id,
                "Collector updated their own profile.",
                cancellationToken);

            return Ok(profile);
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
}
