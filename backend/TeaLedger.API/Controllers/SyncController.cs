
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Sync;
using TeaLedger.API.Services;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/sync")]
[Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
public class SyncController : ControllerBase
{
    private readonly OfflineCollectionSyncService _service;

    public SyncController(OfflineCollectionSyncService service)
    {
        _service = service;
    }

    private Guid CurrentUserId()
    {
        var value = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(value, out var id))
        {
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");
        }

        return id;
    }

    [HttpPost("collections")]
    [ProducesResponseType(typeof(SyncCollectionsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SyncCollections(
        [FromBody] SyncCollectionsRequest input,
        CancellationToken ct)
    {
        if (input.Collections.Count == 0)
        {
            return BadRequest(new
            {
                message = "At least one collection operation is required."
            });
        }

        var result = await _service.SyncAsync(
            CurrentUserId(),
            input,
            ct);

        return Ok(result);
    }
}
