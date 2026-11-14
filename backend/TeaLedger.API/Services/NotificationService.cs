
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TeaLedger.API.Data;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _db;
    private readonly IPushNotificationSender _push;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext db,
        IPushNotificationSender push,
        ILogger<NotificationService> logger)
    {
        _db = db;
        _push = push;
        _logger = logger;
    }

    public async Task NotifyAsync(
        Guid userId,
        string title,
        string message,
        string entityType,
        Guid? entityId,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Message = message,
            EntityType = entityType,
            EntityId = entityId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);

        // Persist the in-app notification independently of push delivery.
        await _db.SaveChangesAsync(cancellationToken);

        if (!_push.IsConfigured)
        {
            _logger.LogWarning(
                "Firebase is not configured. Notification {NotificationId} " +
                "was saved but no push was sent.",
                notification.Id);

            return;
        }

        var devices = await _db.DeviceTokens
            .Where(x => x.UserId == userId && x.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var device in devices)
        {
            try
            {
                await SendWithRetryAsync(
                    device.Token,
                    title,
                    message,
                    new Dictionary<string, string>
                    {
                        ["notificationId"] = notification.Id.ToString(),
                        ["entityType"] = entityType,
                        ["entityId"] = entityId?.ToString() ?? string.Empty
                    },
                    cancellationToken);

                device.LastSeenAt = DateTime.UtcNow;
            }
            catch (OperationCanceledException)
                when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Push delivery failed for notification {NotificationId} " +
                    "and device {DeviceId}.",
                    notification.Id,
                    device.Id);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Notification>> GetForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> MarkAsReadAsync(
        Guid userId,
        Guid notificationId,
        CancellationToken cancellationToken = default)
    {
        var notification = await _db.Notifications
            .SingleOrDefaultAsync(
                x => x.Id == notificationId && x.UserId == userId,
                cancellationToken);

        if (notification is null)
            return false;

        if (notification.ReadAt is null)
        {
            notification.ReadAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
        }

        return true;
    }

    public async Task RegisterDeviceTokenAsync(
        Guid userId,
        string token,
        string platform,
        CancellationToken cancellationToken = default)
    {
        token = token.Trim();
        platform = platform.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(token) || token.Length > 4096)
            throw new ArgumentException("Invalid device token.");

        if (platform is not ("android" or "ios" or "web"))
            throw new ArgumentException("Unsupported device platform.");

        var userExists = await _db.Users
            .AnyAsync(x => x.Id == userId && x.IsActive, cancellationToken);

        if (!userExists)
            throw new UnauthorizedAccessException("Active user not found.");

        var existing = await _db.DeviceTokens
            .SingleOrDefaultAsync(
                x => x.Token == token,
                cancellationToken);

        if (existing is not null)
        {
            // A token that has moved to another signed-in account
            // must no longer belong to the previous account.
            existing.UserId = userId;
            existing.Platform = platform;
            existing.IsActive = true;
            existing.LastSeenAt = DateTime.UtcNow;
        }
        else
        {
            _db.DeviceTokens.Add(new DeviceToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = token,
                Platform = platform,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> RemoveDeviceTokenAsync(
        Guid userId,
        string token,
        CancellationToken cancellationToken = default)
    {
        var device = await _db.DeviceTokens
            .SingleOrDefaultAsync(
                x => x.UserId == userId && x.Token == token,
                cancellationToken);

        if (device is null)
            return false;

        device.IsActive = false;

        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task SendWithRetryAsync(
        string token,
        string title,
        string message,
        Dictionary<string, string> data,
        CancellationToken cancellationToken)
    {
        const int maxAttempts = 3;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await _push.SendAsync(
                    token,
                    title,
                    message,
                    data,
                    cancellationToken);

                return;
            }
            catch (OperationCanceledException)
                when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                _logger.LogWarning(
                    ex,
                    "Push attempt {Attempt} failed. Retrying.",
                    attempt);

                await Task.Delay(
                    TimeSpan.FromSeconds(attempt),
                    cancellationToken);
            }
        }

        // The caller logs the final failure. The in-app notification
        // remains saved even if all push attempts fail.
        throw new InvalidOperationException(
            "Firebase push failed after three attempts.");
    }
}
