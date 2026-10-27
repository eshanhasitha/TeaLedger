using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Authorization;
using TeaLedger.API.Data;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public sealed class AdminDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminDashboardController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard(
        CancellationToken cancellationToken)
    {
        var totalUsers = await _db.Users
            .CountAsync(cancellationToken);

        var activeUsers = await _db.Users
            .CountAsync(u => u.IsActive, cancellationToken);

        var inactiveUsers = await _db.Users
            .CountAsync(u => !u.IsActive, cancellationToken);

        var adminCount = await _db.Users
            .CountAsync(
                u => u.Role == Models.UserRole.Admin,
                cancellationToken);

        var collectorCount = await _db.Users
            .CountAsync(
                u => u.Role == Models.UserRole.Collector,
                cancellationToken);

        var farmerCount = await _db.Users
            .CountAsync(
                u => u.Role == Models.UserRole.Farmer,
                cancellationToken);

        return Ok(new
        {
            generatedAtUtc = DateTime.UtcNow,
            totalUsers,
            activeUsers,
            inactiveUsers,
            usersByRole = new
            {
                admins = adminCount,
                collectors = collectorCount,
                farmers = farmerCount
            }
        });
    }
}