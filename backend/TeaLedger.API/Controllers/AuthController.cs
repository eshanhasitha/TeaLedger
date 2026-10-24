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

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = await _authService.LoginAsync(
            request,
            cancellationToken);

        if (result is null)
        {
            return Unauthorized(new
            {
                message = "Invalid phone number or password."
            });
        }

        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId =
            User.FindFirstValue(
                JwtRegisteredClaimNames.Sub);

        var name =
            User.FindFirstValue(
                JwtRegisteredClaimNames.Name);

        var phone =
            User.FindFirstValue(
                "phone_number");

        var role =
            User.FindFirstValue(
                "role");

        return Ok(new
        {
            userId,
            fullName = name,
            phoneNumber = phone,
            role
        });
    }
}
