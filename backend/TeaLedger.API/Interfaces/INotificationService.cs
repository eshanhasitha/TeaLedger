namespace TeaLedger.API.Interfaces;

public interface INotificationService
{
    Task NotifyAsync(
        Guid userId,
        string title,
        string message,
        string entityType,
        Guid? entityId,
        CancellationToken cancellationToken = default);
}