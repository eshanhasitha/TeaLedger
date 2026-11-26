using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Auth;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ProfileController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ProfileResponse>> GetMyProfile(
        CancellationToken cancellationToken)
    {
        var userIdValue =
            User.FindFirstValue(
                JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var user = await _db.Users
            .AsNoTracking()
            .Include(x => x.Farmer)
            .Include(x => x.Collector)
            .FirstOrDefaultAsync(
                x => x.Id == userId,
                cancellationToken);

        if (user is null)
        {
            return NotFound(new
            {
                message = "User profile was not found."
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                message = "User account is inactive."
            });
        }

        var response = new ProfileResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            FarmerId = user.Farmer?.Id,
            FarmerCode = user.Farmer?.FarmerCode,
            CollectorId = user.Collector?.Id,
            CollectorCode = user.Collector?.CollectorCode
        };

        return Ok(response);
    }
}
