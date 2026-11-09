using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Collections;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/collections")]
public class CollectionsController : ControllerBase
{
    private readonly ICollectionService _service;
    public CollectionsController(ICollectionService service) => _service = service;

    private Guid CurrentUserId()
    {
        var value = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(value, out var id)) throw new UnauthorizedAccessException("Invalid JWT subject claim.");
        return id;
    }

    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    [HttpPost]
    public async Task<IActionResult> Create(CreateCollectionDto input, CancellationToken ct)
    {
        try { return Ok(await _service.CreateAsync(CurrentUserId(), input, ct)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    [HttpGet("my-history")]
    public async Task<IActionResult> MyHistory([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        if (from.HasValue && to.HasValue && from > to) return BadRequest("Invalid date range.");
        return Ok(await _service.FarmerHistoryAsync(CurrentUserId(), from, to, ct));
    }

    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> FarmerDetails(Guid id, CancellationToken ct)
    {
        var result = await _service.GetFarmerCollectionAsync(id, CurrentUserId(), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpGet("/api/admin/collections")]
    public async Task<IActionResult> AdminList([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] Guid? farmerId, CancellationToken ct)
    {
        return Ok(await _service.AdminListAsync(from, to, farmerId, ct));
    }
}
