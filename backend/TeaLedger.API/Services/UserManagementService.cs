using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Users;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class UserManagementService : IUserManagementService
{
    private readonly ApplicationDbContext _db;

    public UserManagementService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<UserListResponse> GetUsersAsync(
        int page,
        int pageSize,
        string? search,
        string? role,
        bool? isActive,
        CancellationToken cancellationToken)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(u =>
                u.FullName.Contains(term) ||
                u.PhoneNumber.Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            if (!Enum.TryParse<UserRole>(
                    role.Trim(),
                    true,
                    out var parsedRole))
            {
                throw new ArgumentException("Invalid role filter.");
            }

            query = query.Where(u => u.Role == parsedRole);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderBy(u => u.FullName)
            .ThenBy(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListItemResponse
            {
                UserId = u.Id,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new UserListResponse
        {
            Items = users,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<UserListItemResponse?> GetUserByIdAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserListItemResponse
            {
                UserId = u.Id,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<UserListItemResponse?> UpdateUserAsync(
        Guid userId,
        UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user is null)
        {
            return null;
        }

        var fullName = request.FullName.Trim();
        var phoneNumber = NormalizePhone(request.PhoneNumber);

        if (string.IsNullOrWhiteSpace(fullName) ||
            string.IsNullOrWhiteSpace(phoneNumber))
        {
            throw new ArgumentException(
                "Name and phone number are required.");
        }

        var duplicatePhone = await _db.Users.AnyAsync(
            u => u.Id != userId &&
                 u.PhoneNumber == phoneNumber,
            cancellationToken);

        if (duplicatePhone)
        {
            throw new InvalidOperationException(
                "This phone number is already registered.");
        }

        user.FullName = fullName;
        user.PhoneNumber = phoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return new UserListItemResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> SetUserStatusAsync(
        Guid userId,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user is null)
        {
            return false;
        }

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string NormalizePhone(string phoneNumber)
    {
        return phoneNumber
            .Trim()
            .Replace(" ", string.Empty)
            .Replace("-", string.Empty);
    }
}