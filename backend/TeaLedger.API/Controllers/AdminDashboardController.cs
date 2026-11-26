
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Authorization;
using TeaLedger.API.Data;
using TeaLedger.API.Services;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public sealed class AdminDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly DashboardService _dashboard;

    public AdminDashboardController(
        ApplicationDbContext db,
        DashboardService dashboard)
    {
        _db = db;
        _dashboard = dashboard;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        try
        {
            var dashboard = await _dashboard.GetAdminAsync(
                from, to, ct);

            var totalUsers = await _db.Users.CountAsync(ct);
            var activeUsers = await _db.Users.CountAsync(
                x => x.IsActive, ct);

            var usersByRole = new
            {
                admins = await _db.Users.CountAsync(
                    x => x.Role == Models.UserRole.Admin, ct),

                collectors = await _db.Users.CountAsync(
                    x => x.Role == Models.UserRole.Collector, ct),

                farmers = await _db.Users.CountAsync(
                    x => x.Role == Models.UserRole.Farmer, ct)
            };

            return Ok(new
            {
                GeneratedAt = DateTime.UtcNow,
                users = new
                {
                    totalUsers,
                    activeUsers,
                    inactiveUsers = totalUsers - activeUsers,
                    usersByRole
                },
                dashboard.Summary,
                dashboard.DailyCollections
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
