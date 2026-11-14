
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.DTOs.Notifications;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/notifications/device-tokens")]
[Authorize]
public sealed class DeviceTokensController : ControllerBase
{
    private readonly INotificationService _notifications;

    public DeviceTokensController(
        INotificationService notifications)
    {
        _notifications = notifications;
    }

    private Guid CurrentUserId()
    {
        var subject =
            User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(subject, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");
        }

        return userId;
    }

    [HttpPost]
    public async Task<IActionResult> Register(
        [FromBody] RegisterDeviceTokenDto input,
        CancellationToken cancellationToken)
    {
        await _notifications.RegisterDeviceTokenAsync(
            CurrentUserId(),
            input.Token,
            input.Platform,
            cancellationToken);

        return Ok(new
        {
            message = "Device token registered successfully."
        });
    }

    [HttpDelete]
    public async Task<IActionResult> Remove(
        [FromQuery] string token,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Token is required." });

        var removed = await _notifications.RemoveDeviceTokenAsync(
            CurrentUserId(),
            token,
            cancellationToken);

        return removed
            ? NoContent()
            : NotFound(new { message = "Device token not found." });
    }
}