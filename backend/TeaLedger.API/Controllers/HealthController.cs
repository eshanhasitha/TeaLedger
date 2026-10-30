
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HealthController(ApplicationDbContext db)
    {
        _db = db;
    }

    [AllowAnonymous]
    [HttpGet]
    public IActionResult GetApplicationHealth()
    {
        return Ok(new
        {
            status = "Healthy",
            service = "TeaLedger.API"
        });
    }

    [AllowAnonymous]
    [HttpGet("database")]
    public async Task<IActionResult> GetDatabaseHealth(
        CancellationToken cancellationToken)
    {
        try
        {
            var canConnect =
                await _db.Database.CanConnectAsync(cancellationToken);

            if (!canConnect)
            {
                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new
                    {
                        status = "Unhealthy",
                        database = "Unavailable"
                    });
            }

            return Ok(new
            {
                status = "Healthy",
                database = "Connected"
            });
        }
        catch (Exception)
        {
            // Don't return connection strings or internal exception details.
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new
                {
                    status = "Unhealthy",
                    database = "Unavailable"
                });
        }
    }
}
