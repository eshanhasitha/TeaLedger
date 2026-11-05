using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.TeaPrices;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/tea-prices")]
[Authorize]
public sealed class TeaPricesController : ControllerBase
{
    private readonly ITeaPriceService _teaPriceService;

    public TeaPricesController(
        ITeaPriceService teaPriceService)
    {
        _teaPriceService = teaPriceService;
    }

    // Collector sets the monthly price for their own collector account.
    [HttpPut("monthly")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> SetMonthlyPrice(
        [FromBody] SetMonthlyTeaPriceDto input,
        CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();

            var result =
                await _teaPriceService
                    .SetMonthlyPriceForCollectorUserAsync(
                        userId,
                        input,
                        ct);

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

    // Farmer or collector gets the price applicable on a date.
    [HttpGet("current")]
    [Authorize(Roles = "Farmer,Collector")]
    public async Task<IActionResult> GetCurrentPrice(
        [FromQuery] DateTime? date,
        CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();

            var result =
                await _teaPriceService
                    .GetEffectivePriceForUserAsync(
                        userId,
                        date ?? DateTime.UtcNow,
                        ct);

            if (result is null)
            {
                return NotFound(new
                {
                    message = "No applicable tea price was found."
                });
            }

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // Farmer or collector sees the history for their collector.
    [HttpGet("history")]
    [Authorize(Roles = "Farmer,Collector")]
    public async Task<IActionResult> GetPriceHistory(
        CancellationToken ct)
    {
        try
        {
            var result =
                await _teaPriceService
                    .GetPriceHistoryForUserAsync(
                        GetUserId(),
                        ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // Admin sets a price for a selected collector.
    [HttpPut("admin/collectors/{collectorId:guid}/monthly")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> AdminSetMonthlyPrice(
        Guid collectorId,
        [FromBody] SetMonthlyTeaPriceDto input,
        CancellationToken ct)
    {
        try
        {
            var result =
                await _teaPriceService
                    .SetMonthlyPriceForAdminAsync(
                        GetUserId(),
                        collectorId,
                        input,
                        ct);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // Admin sees the price history of a selected collector.
    [HttpGet("admin/collectors/{collectorId:guid}/history")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> AdminGetPriceHistory(
        Guid collectorId,
        CancellationToken ct)
    {
        try
        {
            var result =
                await _teaPriceService
                    .GetAdminPriceHistoryAsync(
                        collectorId,
                        ct);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // Gets the current user's ID.
    private Guid GetUserId()
    {
        var value =
            User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        return userId;
    }
}