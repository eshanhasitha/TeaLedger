using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Users;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public sealed class UsersController : ControllerBase
{
    private readonly IUserManagementService _userService;

    public UsersController(IUserManagementService userService)
    {
        _userService = userService;
    }

    // GET: /api/admin/users?page=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<UserListResponse>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new
            {
                message = "Page must be at least 1 and pageSize must be between 1 and 100."
            });
        }

        try
        {
            var result = await _userService.GetUsersAsync(
                page,
                pageSize,
                search,
                role,
                isActive,
                cancellationToken);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: /api/admin/users/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserListItemResponse>> GetUser(
        Guid id,
        CancellationToken cancellationToken)
    {
        var user = await _userService.GetUserByIdAsync(
            id,
            cancellationToken);

        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(user);
    }

    // PUT: /api/admin/users/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserListItemResponse>> UpdateUser(
        Guid id,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _userService.UpdateUserAsync(
                id,
                request,
                cancellationToken);

            if (updated is null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PATCH: /api/admin/users/{id}/status
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> SetUserStatus(
        Guid id,
        [FromBody] UpdateUserStatusRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == id && !request.IsActive)
        {
            return BadRequest(new
            {
                message = "You cannot deactivate your own account."
            });
        }

        var updated = await _userService.SetUserStatusAsync(
            id,
            request.IsActive,
            cancellationToken);

        if (!updated)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(new
        {
            userId = id,
            isActive = request.IsActive,
            message = request.IsActive
                ? "User account activated."
                : "User account deactivated."
        });
    }

    private Guid? GetCurrentUserId()
    {
        var value = User.FindFirstValue("sub")
                    ?? User.FindFirstValue(
                        ClaimTypes.NameIdentifier);

        return Guid.TryParse(value, out var id) ? id : null;
    }
}