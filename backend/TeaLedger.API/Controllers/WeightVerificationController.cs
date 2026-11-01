using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Collections;
using TeaLedger.API.Services;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/collections")]
public class WeightVerificationController : ControllerBase
{
    private readonly WeightVerificationService _service;

    public WeightVerificationController(
        WeightVerificationService service)
    {
        _service = service;
    }

    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    [HttpPost("{id:guid}/verify-weight")]
    public async Task<IActionResult> Verify(
        Guid id,
        VerifyWeightDto input,
        CancellationToken ct)
    {
        var subject = User.FindFirst(
            JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(subject, out var userId))
            return Unauthorized();

        var result = await _service.VerifyAsync(
            userId, id, input, ct);

        return result == null ? NotFound() : Ok(result);
    }
}