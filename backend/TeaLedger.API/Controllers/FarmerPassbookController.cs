using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.Services;

namespace TeaLedger.API.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
[Route("api/farmers/me/passbook")]
public class FarmerPassbookController : ControllerBase
{
    private readonly CollectionService _service;

    public FarmerPassbookController(CollectionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var subject = User.FindFirst(
            JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(subject, out var userId))
            return Unauthorized();

        if (from.HasValue && to.HasValue && from > to)
            return BadRequest("Invalid date range.");

        var result = await _service.PassbookAsync(
            userId, from, to, ct);

        return Ok(result);
    }
}