namespace TeaLedger.API.DTOs.Users;

public sealed class UserListResponse
{
    public IReadOnlyList<UserListItemResponse> Items { get; init; }
        = Array.Empty<UserListItemResponse>();

    public int Page { get; init; }

    public int PageSize { get; init; }

    public int TotalCount { get; init; }

    public int TotalPages =>
        (int)Math.Ceiling((double)TotalCount / PageSize);
}