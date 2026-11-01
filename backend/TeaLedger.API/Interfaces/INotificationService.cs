namespace TeaLedger.API.Interfaces;

using TeaLedger.API.Models;

public interface INotificationService
{
    Task NotifyAsync(
        Guid userId,
        string title,
        string message,
        string entityType,
        Guid? entityId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Notification>> GetForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<bool> MarkAsReadAsync(
        Guid userId,
        Guid notificationId,
        CancellationToken cancellationToken = default);
}
