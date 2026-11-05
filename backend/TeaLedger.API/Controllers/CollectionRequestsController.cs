using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.CollectionRequests;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/collection-requests")]
public class CollectionRequestsController : ControllerBase
{
    private readonly CollectionRequestService _service;

    public CollectionRequestsController(
        CollectionRequestService service)
    {
        _service = service;
    }

    private Guid CurrentUserId()
    {
        var value = User.FindFirst(
            JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(value, out var id))
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");

        return id;
    }

    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateCollectionRequestDto input,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.CreateAsync(
                CurrentUserId(), input, ct);

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
    [HttpGet("my")]
    public async Task<IActionResult> My(CancellationToken ct)
    {
        return Ok(await _service.GetFarmerRequestsAsync(
            CurrentUserId(), ct));
    }

    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    [HttpGet("collector")]
    public async Task<IActionResult> Collector(
        [FromQuery] CollectionRequestStatus? status,
        CancellationToken ct)
    {
        return Ok(await _service.GetCollectorRequestsAsync(
            CurrentUserId(), status, ct));
    }

    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    [HttpPatch("{id:guid}/decision")]
    public async Task<IActionResult> Decide(
        Guid id,
        DecideCollectionRequestDto input,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.DecideAsync(
                CurrentUserId(), id, input, ct);

            return result == null ? NotFound() : Ok(result);
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

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpGet("/api/admin/collection-requests")]
    public async Task<IActionResult> AdminList(
        [FromQuery] CollectionRequestStatus? status,
        CancellationToken ct)
    {
        return Ok(await _service.GetAllForAdminAsync(status, ct));
    }
}
