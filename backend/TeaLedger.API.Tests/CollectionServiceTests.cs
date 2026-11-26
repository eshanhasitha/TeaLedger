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
    public async Task CreateAsync_RejectsRequestAssignedToAnotherCollector()
    {
        var scenario = await CreateScenarioAsync();
        await using var db = scenario.Db;
        var service = CreateService(db);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(
                scenario.OtherCollectorUser.Id,
                new CreateCollectionDto { RequestId = scenario.Request.Id },
                CancellationToken.None));

        Assert.Equal(
            "Request was not found for this collector.",
            exception.Message);
        Assert.Empty(await db.Collections.ToListAsync());
    }

    [Fact]
    public async Task CreateAsync_RejectsPendingRequest()
    {
        var scenario = await CreateScenarioAsync(
            requestStatus: CollectionRequestStatus.Pending);
        await using var db = scenario.Db;
        var service = CreateService(db);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(
                scenario.CollectorUser.Id,
                new CreateCollectionDto { RequestId = scenario.Request.Id },
                CancellationToken.None));

        Assert.Equal("Only accepted requests can be collected.", exception.Message);
        Assert.Empty(await db.Collections.ToListAsync());
    }

    [Fact]
    public async Task CreateAsync_RejectsSecondCollectionForRequest()
    {
        var scenario = await CreateScenarioAsync(
            includeExistingCollection: true);
        await using var db = scenario.Db;
        var service = CreateService(db);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(
                scenario.CollectorUser.Id,
                new CreateCollectionDto { RequestId = scenario.Request.Id },
                CancellationToken.None));

        Assert.Equal(
            "A collection already exists for this request.",
            exception.Message);
        Assert.Single(await db.Collections.ToListAsync());
    }

    [Fact]
    public async Task CreateAsync_RejectsInactiveFarmer()
    {
        var scenario = await CreateScenarioAsync(farmerActive: false);
        await using var db = scenario.Db;
        var service = CreateService(db);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(
                scenario.CollectorUser.Id,
                new CreateCollectionDto { RequestId = scenario.Request.Id },
                CancellationToken.None));

        Assert.Equal("Farmer account is inactive.", exception.Message);
        Assert.Empty(await db.Collections.ToListAsync());
    }

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

    private static CollectionService CreateService(ApplicationDbContext db)
    {
        return new CollectionService(
            db,
            new NoOpNotificationService(),
            NullLogger<CollectionService>.Instance);
    }

    private static async Task<CollectionScenario> CreateScenarioAsync(
        CollectionRequestStatus requestStatus = CollectionRequestStatus.Accepted,
        bool farmerActive = true,
        bool includeExistingCollection = false)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(
                InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        var db = new ApplicationDbContext(options);

        var collectorUser = CreateUser(UserRole.Collector);
        var otherCollectorUser = CreateUser(UserRole.Collector);
        var farmerUser = CreateUser(UserRole.Farmer);
        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = collectorUser.Id,
            CollectorCode = $"COL-{Guid.NewGuid():N}",
            User = collectorUser
        };
        var otherCollector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = otherCollectorUser.Id,
            CollectorCode = $"COL-{Guid.NewGuid():N}",
            User = otherCollectorUser
        };
        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = farmerUser.Id,
            CollectorId = collector.Id,
            FarmerCode = $"FAR-{Guid.NewGuid():N}",
            IsActive = farmerActive,
            User = farmerUser,
            Collector = collector
        };
        var request = new CollectionRequest
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            Farmer = farmer,
            Status = requestStatus,
            EstimatedQuantityKg = 10
        };

        db.Users.AddRange(collectorUser, otherCollectorUser, farmerUser);
        db.Collectors.AddRange(collector, otherCollector);
        db.Farmers.Add(farmer);
        db.CollectionRequests.Add(request);

        if (includeExistingCollection)
        {
            db.Collections.Add(new Collection
            {
                Id = Guid.NewGuid(),
                RequestId = request.Id,
                Request = request,
                FarmerId = farmer.Id,
                Farmer = farmer,
                CollectorId = collector.Id,
                Status = CollectionStatus.Pending,
                CollectedAt = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();

        return new CollectionScenario(
            db,
            collectorUser,
            otherCollectorUser,
            request);
    }

    private static User CreateUser(UserRole role)
    {
        var id = Guid.NewGuid();
        return new User
        {
            Id = id,
            FullName = $"Test {role}",
            PhoneNumber = $"{role}-{id:N}",
            PasswordHash = "test",
            Role = role,
            IsActive = true
        };
    }

    private sealed record CollectionScenario(
        ApplicationDbContext Db,
        User CollectorUser,
        User OtherCollectorUser,
        CollectionRequest Request);

    private sealed class NoOpNotificationService : INotificationService
    {
        public Task NotifyAsync(
            Guid userId,
            string title,
            string message,
            string entityType,
            Guid? entityId,
            CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

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
