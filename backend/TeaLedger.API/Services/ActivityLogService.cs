
using TeaLedger.API.Data;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class ActivityLogService : IActivityLogService
{
    private readonly ApplicationDbContext _db;

    public ActivityLogService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task RecordAsync(
        Guid? actorUserId,
        string action,
        string entityType,
        Guid? entityId,
        string? details,
        CancellationToken cancellationToken = default)
    {
        var log = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = actorUserId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            OccurredAt = DateTime.UtcNow
        };

        await _db.ActivityLogs.AddAsync(
            log, cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);
    }
}
