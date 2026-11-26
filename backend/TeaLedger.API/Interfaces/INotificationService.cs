
using TeaLedger.API.Models;

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

    Task<IReadOnlyList<Notification>> GetForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<bool> MarkAsReadAsync(
        Guid userId,
        Guid notificationId,
        CancellationToken cancellationToken = default);

    Task RegisterDeviceTokenAsync(
        Guid userId,
        string token,
        string platform,
        CancellationToken cancellationToken = default);

    Task<bool> RemoveDeviceTokenAsync(
        Guid userId,
        string token,
        CancellationToken cancellationToken = default);
}