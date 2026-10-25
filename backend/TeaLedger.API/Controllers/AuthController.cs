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
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var name = User.FindFirstValue(JwtRegisteredClaimNames.Name);
        var phone = User.FindFirstValue("phone_number");
        var role = User.FindFirstValue("role");

        return Ok(new
        {
            userId,
            fullName = name,
            phoneNumber = phone,
            role
        });
    }
}
