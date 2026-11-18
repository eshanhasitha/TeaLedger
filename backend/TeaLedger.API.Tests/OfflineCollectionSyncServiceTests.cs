
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Sync;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public class OfflineCollectionSyncServiceTests
{
    private static ApplicationDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private sealed class FakeNotificationService : INotificationService
    {
        public int Calls { get; private set; }

        public Task NotifyAsync(
            Guid userId,
            string title,
            string message,
            string entityType,
            Guid? entityId,
            CancellationToken cancellationToken = default)
        {
            Calls++;
            return Task.CompletedTask;
        }

        public Task<IReadOnlyList<Notification>> GetForUserAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Notification>>([]);

        public Task<bool> MarkAsReadAsync(
            Guid userId,
            Guid notificationId,
            CancellationToken cancellationToken = default)
            => Task.FromResult(false);

        public Task RegisterDeviceTokenAsync(
            Guid userId,
            string token,
            string platform,
            CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task<bool> RemoveDeviceTokenAsync(
            Guid userId,
            string token,
            CancellationToken cancellationToken = default)
            => Task.FromResult(false);
    }

    private static async Task<(Guid CollectorUserId, Guid RequestId)>
        SeedAcceptedRequest(ApplicationDbContext db)
    {
        var collectorUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Collector",
            PhoneNumber = "0771000001",
            PasswordHash = "test",
            Role = UserRole.Collector,
            IsActive = true
        };

        var farmerUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Farmer",
            PhoneNumber = "0771000002",
            PasswordHash = "test",
            Role = UserRole.Farmer,
            IsActive = true
        };

        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = collectorUser.Id,
            CollectorCode = "COL-TEST",
            User = collectorUser
        };

        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = farmerUser.Id,
            CollectorId = collector.Id,
            FarmerCode = "FAR-TEST",
            IsActive = true,
            User = farmerUser,
            Collector = collector
        };

        var request = new CollectionRequest
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            Farmer = farmer,
            Status = CollectionRequestStatus.Accepted,
            EstimatedQuantityKg = 10,
            RequestedAt = DateTime.UtcNow
        };

        db.Users.AddRange(collectorUser, farmerUser);
        db.Collectors.Add(collector);
        db.Farmers.Add(farmer);
        db.CollectionRequests.Add(request);

        await db.SaveChangesAsync();

        return (collectorUser.Id, request.Id);
    }

    [Fact]
    public async Task SyncAsync_CreatesCollectionAndSyncRecord()
    {
        await using var db = CreateDb();
        var seeded = await SeedAcceptedRequest(db);
        var notifications = new FakeNotificationService();

        var service = new OfflineCollectionSyncService(
            db,
            notifications,
            NullLogger<OfflineCollectionSyncService>.Instance);

        var operationId = Guid.NewGuid();

        var result = await service.SyncAsync(
            seeded.CollectorUserId,
            new SyncCollectionsRequest
            {
                Collections =
                [
                    new OfflineCollectionSyncDto
                    {
                        ClientOperationId = operationId,
                        RequestId = seeded.RequestId,
                        CollectedAt = DateTime.UtcNow
                    }
                ]
            },
            CancellationToken.None);

        Assert.Equal(1, result.Synced);
        Assert.Equal(0, result.Conflicts);
        Assert.Equal(1, await db.Collections.CountAsync());
        Assert.Equal(1, await db.OfflineCollectionSyncs.CountAsync());

        var request = await db.CollectionRequests
            .SingleAsync(x => x.Id == seeded.RequestId);

        Assert.Equal(CollectionRequestStatus.Collected, request.Status);
        Assert.Equal(1, notifications.Calls);
    }

    [Fact]
    public async Task SyncAsync_RetryDoesNotCreateDuplicateCollection()
    {
        await using var db = CreateDb();
        var seeded = await SeedAcceptedRequest(db);
        var notifications = new FakeNotificationService();

        var service = new OfflineCollectionSyncService(
            db,
            notifications,
            NullLogger<OfflineCollectionSyncService>.Instance);

        var operationId = Guid.NewGuid();

        var request = new SyncCollectionsRequest
        {
            Collections =
            [
                new OfflineCollectionSyncDto
                {
                    ClientOperationId = operationId,
                    RequestId = seeded.RequestId,
                    CollectedAt = DateTime.UtcNow
                }
            ]
        };

        var first = await service.SyncAsync(
            seeded.CollectorUserId,
            request,
            CancellationToken.None);

        var second = await service.SyncAsync(
            seeded.CollectorUserId,
            request,
            CancellationToken.None);

        Assert.Equal(1, first.Synced);
        Assert.Equal(1, second.Synced);
        Assert.True(second.Results[0].WasPreviouslySynced);

        Assert.Equal(1, await db.Collections.CountAsync());
        Assert.Equal(1, await db.OfflineCollectionSyncs.CountAsync());
        Assert.Equal(1, notifications.Calls);
    }

    [Fact]
    public async Task SyncAsync_RejectsAnotherCollectorsRequest()
    {
        await using var db = CreateDb();
        var seeded = await SeedAcceptedRequest(db);

        var otherCollectorUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Another Collector",
            PhoneNumber = "0771000003",
            PasswordHash = "test",
            Role = UserRole.Collector,
            IsActive = true
        };
        db.Users.Add(otherCollectorUser);
        db.Collectors.Add(new Collector
        {
            Id = Guid.NewGuid(),
            UserId = otherCollectorUser.Id,
            CollectorCode = "COL-OTHER",
            User = otherCollectorUser
        });
        await db.SaveChangesAsync();

        var notifications = new FakeNotificationService();

        var service = new OfflineCollectionSyncService(
            db,
            notifications,
            NullLogger<OfflineCollectionSyncService>.Instance);

        var result = await service.SyncAsync(
            otherCollectorUser.Id,
            new SyncCollectionsRequest
            {
                Collections =
                [
                    new OfflineCollectionSyncDto
                    {
                        ClientOperationId = Guid.NewGuid(),
                        RequestId = seeded.RequestId,
                        CollectedAt = DateTime.UtcNow
                    }
                ]
            },
            CancellationToken.None);

        Assert.Equal(1, result.Rejected);
        Assert.Empty(await db.Collections.ToListAsync());
    }
}
