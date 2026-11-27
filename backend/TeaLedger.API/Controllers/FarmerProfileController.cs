
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Farmers;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/farmer/profile")]
[Authorize(Roles = "Farmer")]
public sealed class FarmerProfileController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public FarmerProfileController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FarmerProfileDto>> GetProfile(
        CancellationToken cancellationToken)
    {
        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new
            {
                success = false,
                message = "The token does not contain a user identifier."
            });

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "The token contains an invalid user identifier."
            });
        }

        var farmer = await _db.Farmers
            .AsNoTracking()
            .Include(f => f.User)
            .FirstOrDefaultAsync(
                f => f.UserId == parsedUserId,
                cancellationToken);

        if (farmer is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Farmer profile was not found."
            });
        }

        if (!farmer.IsActive)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    success = false,
                    message = "This farmer account is inactive."
                });
        }

        var result = new FarmerProfileDto
        {
            Id = farmer.Id,
            FarmerCode = farmer.FarmerCode,
            FullName = farmer.User?.FullName ?? string.Empty,
            Email = string.Empty,
            PhoneNumber = farmer.User?.PhoneNumber,
            Address = farmer.Address,
            TeaLandSize = farmer.TeaLandSize,
            IsActive = farmer.IsActive
        };

        return Ok(result);
    }
}
