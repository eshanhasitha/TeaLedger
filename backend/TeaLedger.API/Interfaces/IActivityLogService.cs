
namespace TeaLedger.API.Interfaces;

public interface IActivityLogService
{
    Task RecordAsync(
        Guid? actorUserId,
        string action,
        string entityType,
        Guid? entityId,
        string? details,
        CancellationToken cancellationToken = default);
}
