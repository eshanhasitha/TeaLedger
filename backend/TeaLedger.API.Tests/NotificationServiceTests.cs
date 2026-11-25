
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TeaLedger.API.Data;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class NotificationServiceTests
{
    private static ApplicationDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private sealed class FakePushSender : IPushNotificationSender
    {
        public bool IsConfigured { get; set; } = true;

        public int SendCount { get; private set; }

        public bool ShouldFail { get; set; }

        public Task SendAsync(
            string token,
            string title,
            string body,
            Dictionary<string, string> data,
            CancellationToken cancellationToken = default)
        {
            SendCount++;

            if (ShouldFail)
                throw new InvalidOperationException("Simulated FCM failure.");

            return Task.CompletedTask;
        }
    }

    private static NotificationService CreateService(
        ApplicationDbContext db,
        FakePushSender sender)
    {
        return new NotificationService(
            db,
            sender,
            NullLogger<NotificationService>.Instance);
    }

    [Fact]
    public async Task NotifyAsync_SavesNotification()
    {
        await using var db = CreateDb();
        var sender = new FakePushSender();
        var service = CreateService(db, sender);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Farmer",
            PhoneNumber = "0771234567",
            PasswordHash = "test-hash",
            Role = UserRole.Farmer,
            IsActive = true
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        await service.NotifyAsync(
            user.Id,
            "Collection confirmed",
            "Your collection was recorded.",
            "Collection",
            Guid.NewGuid());

        var saved = await db.Notifications
            .SingleAsync();

        Assert.Equal(user.Id, saved.UserId);
        Assert.Equal("Collection confirmed", saved.Title);
    }

    [Fact]
    public async Task NotifyAsync_SendsPushToRegisteredDevice()
    {
        await using var db = CreateDb();
        var sender = new FakePushSender();
        var service = CreateService(db, sender);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Farmer",
            PhoneNumber = "0771234567",
            PasswordHash = "test-hash",
            Role = UserRole.Farmer,
            IsActive = true
        };

        db.Users.Add(user);

        db.DeviceTokens.Add(new DeviceToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "test-firebase-device-token-123456",
            Platform = "android",
            IsActive = true
        });

        await db.SaveChangesAsync();

        await service.NotifyAsync(
            user.Id,
            "Tea collection confirmed",
            "Your collection is recorded.",
            "Collection",
            Guid.NewGuid());

        Assert.Equal(1, sender.SendCount);
    }

    [Fact]
    public async Task NotifyAsync_PushFailure_DoesNotDeleteNotification()
    {
        await using var db = CreateDb();
        var sender = new FakePushSender
        {
            ShouldFail = true
        };

        var service = CreateService(db, sender);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Farmer",
            PhoneNumber = "0771234567",
            PasswordHash = "test-hash",
            Role = UserRole.Farmer,
            IsActive = true
        };

        db.Users.Add(user);

        db.DeviceTokens.Add(new DeviceToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "test-firebase-device-token-123456",
            Platform = "android",
            IsActive = true
        });

        await db.SaveChangesAsync();

        await service.NotifyAsync(
            user.Id,
            "Test notification",
            "Testing push failure.",
            "Test",
            null);

        Assert.Single(await db.Notifications.ToListAsync());
        Assert.Equal(3, sender.SendCount);
    }

    [Fact]
    public async Task RegisterDeviceTokenAsync_RegistersTokenForUser()
    {
        await using var db = CreateDb();
        var service = CreateService(db, new FakePushSender());

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Farmer",
            PhoneNumber = "0771234567",
            PasswordHash = "test-hash",
            Role = UserRole.Farmer,
            IsActive = true
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        await service.RegisterDeviceTokenAsync(
            user.Id,
            "test-firebase-device-token-123456",
            "android");

        var device = await db.DeviceTokens.SingleAsync();

        Assert.Equal(user.Id, device.UserId);
        Assert.True(device.IsActive);
        Assert.Equal("android", device.Platform);
    }

    [Fact]
    public async Task MarkAsReadAsync_OnlyUpdatesOwningUsersNotification()
    {
        await using var db = CreateDb();
        var service = CreateService(db, new FakePushSender());

        var owner = Guid.NewGuid();
        var otherUser = Guid.NewGuid();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = owner,
            Title = "Test",
            Message = "Test message",
            EntityType = "Test"
        };

        db.Notifications.Add(notification);
        await db.SaveChangesAsync();

        var result = await service.MarkAsReadAsync(
            otherUser,
            notification.Id);

        Assert.False(result);
        Assert.Null((await db.Notifications.SingleAsync()).ReadAt);
    }
}
