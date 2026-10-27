using TeaLedger.API.DTOs.Users;

namespace TeaLedger.API.Interfaces;

public interface IUserManagementService
{
    Task<UserListResponse> GetUsersAsync(
        int page,
        int pageSize,
        string? search,
        string? role,
        bool? isActive,
        CancellationToken cancellationToken);

    Task<UserListItemResponse?> GetUserByIdAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<UserListItemResponse?> UpdateUserAsync(
        Guid userId,
        UpdateUserRequest request,
        CancellationToken cancellationToken);

    Task<bool> SetUserStatusAsync(
        Guid userId,
        bool isActive,
        CancellationToken cancellationToken);
}