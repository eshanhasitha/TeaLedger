
namespace TeaLedger.API.Models;

public class ActivityLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? ActorUserId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string EntityType { get; set; } = string.Empty;

    public Guid? EntityId { get; set; }

    public string? Details { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
