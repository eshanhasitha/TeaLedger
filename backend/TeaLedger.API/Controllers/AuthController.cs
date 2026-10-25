using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.DTOs.Auth;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(
        IAuthService authService)
    {
        _authService = authService;
    }

    // ---------------------------------------------------------
    // POST: api/Auth/login
    // ---------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState);
        }

        var result =
            await _authService.LoginAsync(
                request,
                cancellationToken);

        if (result is null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid phone number or password."
            });
        }

        return Ok(result);
    }

    // ---------------------------------------------------------
    // POST: api/Auth/register
    // ---------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState);
        }

        try
        {
            var result =
                await _authService.RegisterAsync(
                    request,
                    cancellationToken);

            return StatusCode(
                StatusCodes.Status201Created,
                result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ---------------------------------------------------------
    // GET: api/Auth/me
    // ---------------------------------------------------------

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserResponse>> Me(
        CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var user = await _authService.GetCurrentUserAsync(
            userId,
            cancellationToken);

        if (user is null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                message = "User account is inactive."
            });
        }

        return Ok(user);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userIdValue = User.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var changed = await _authService.ChangePasswordAsync(
            userId,
            request,
            cancellationToken);

        if (!changed)
        {
            return BadRequest(new
            {
                message = "Current password is incorrect or the new password is invalid."
            });
        }

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }
}
