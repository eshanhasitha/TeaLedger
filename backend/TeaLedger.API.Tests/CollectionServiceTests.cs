using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging.Abstractions;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Collections;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class CollectionServiceTests
{
    [Fact]
    public async Task CreateAsync_NotificationFailure_LeavesCollectionCommitted()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(
                InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        await using var db = new ApplicationDbContext(options);
        var collectorUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Collector",
            PhoneNumber = "0778000001",
            PasswordHash = "test",
            Role = UserRole.Collector
        };
        var farmerUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Farmer",
            PhoneNumber = "0778000002",
            PasswordHash = "test",
            Role = UserRole.Farmer
        };
        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = collectorUser.Id,
            CollectorCode = "COL-NOTIFY-TEST",
            User = collectorUser
        };
        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = farmerUser.Id,
            CollectorId = collector.Id,
            FarmerCode = "FAR-NOTIFY-TEST",
            User = farmerUser,
            Collector = collector
        };
        var request = new CollectionRequest
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            Farmer = farmer,
            Status = CollectionRequestStatus.Accepted,
            EstimatedQuantityKg = 10
        };

        db.Users.AddRange(collectorUser, farmerUser);
        db.Collectors.Add(collector);
        db.Farmers.Add(farmer);
        db.CollectionRequests.Add(request);
        await db.SaveChangesAsync();

        var service = new CollectionService(
            db,
            new FailingNotificationService(),
            NullLogger<CollectionService>.Instance);

        var result = await service.CreateAsync(
            collectorUser.Id,
            new CreateCollectionDto { RequestId = request.Id },
            CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(1, await db.Collections.CountAsync());
        Assert.Equal(
            CollectionRequestStatus.Collected,
            (await db.CollectionRequests.SingleAsync()).Status);
    }

    private sealed class FailingNotificationService : INotificationService
    {
        public Task NotifyAsync(
            Guid userId,
            string title,
            string message,
            string entityType,
            Guid? entityId,
            CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("Notification provider unavailable.");

        public Task<IReadOnlyList<Notification>> GetForUserAsync(
            Guid userId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Notification>>([]);

        public Task<bool> MarkAsReadAsync(
            Guid userId,
            Guid notificationId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task RegisterDeviceTokenAsync(
            Guid userId,
            string token,
            string platform,
            CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

        public Task<bool> RemoveDeviceTokenAsync(
            Guid userId,
            string token,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
    }
}
