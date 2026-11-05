
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Farmers;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;
using TeaLedger.API.Repositories;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class FarmerServiceTests
{
    private static ApplicationDbContext CreateDatabase()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static async Task<(Guid CollectorUserId,
        Guid CollectorId, Guid FarmerUserId)> SeedUsersAsync(
        ApplicationDbContext db)
    {
        var collectorUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Collector",
            PhoneNumber = "0771000001",
            PasswordHash = "test-hash",
            Role = UserRole.Collector,
            IsActive = true
        };

        var farmerUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Farmer",
            PhoneNumber = "0771000002",
            PasswordHash = "test-hash",
            Role = UserRole.Farmer,
            IsActive = true
        };

        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = collectorUser.Id,
            CollectorCode = "COL-TEST01",
            User = collectorUser
        };

        db.Users.AddRange(collectorUser, farmerUser);
        db.Collectors.Add(collector);

        await db.SaveChangesAsync();

        return (collectorUser.Id, collector.Id, farmerUser.Id);
    }

    private static IFarmerService CreateService(
        ApplicationDbContext db)
    {
        IFarmerRepository repository = new FarmerRepository(db);
        return new FarmerService(repository);
    }

    private static CreateFarmerRequest CreateRequest(
        Guid userId,
        string code = "FARMER-001")
    {
        return new CreateFarmerRequest
        {
            UserId = userId,
            FarmerCode = code,
            Address = "Test village, Sri Lanka",
            FarmSizeHectares = 1.5m
        };
    }

    [Fact]
    public async Task CreateCollectorFarmer_AssignsAuthenticatedCollector()
    {
        await using var db = CreateDatabase();

        var ids = await SeedUsersAsync(db);
        var service = CreateService(db);

        var result = await service.CreateCollectorFarmerAsync(
            ids.CollectorUserId,
            CreateRequest(ids.FarmerUserId),
            CancellationToken.None);

        var saved = await db.Farmers.SingleAsync(
            f => f.Id == result.FarmerId);

        Assert.Equal(ids.CollectorId, saved.CollectorId);
        Assert.Equal(ids.FarmerUserId, saved.UserId);
        Assert.Equal("FARMER-001", saved.FarmerCode);
    }

    [Fact]
    public async Task CollectorCannotReadAnotherCollectorsFarmer()
    {
        await using var db = CreateDatabase();

        var first = await SeedUsersAsync(db);
        var second = await SeedUsersAsync(db);

        var service = CreateService(db);

        var created = await service.CreateCollectorFarmerAsync(
            first.CollectorUserId,
            CreateRequest(first.FarmerUserId),
            CancellationToken.None);

        var result = await service.GetCollectorFarmerByIdAsync(
            second.CollectorUserId,
            created.FarmerId,
            CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task CollectorList_ReturnsOnlyAssignedFarmers()
    {
        await using var db = CreateDatabase();

        var first = await SeedUsersAsync(db);
        var second = await SeedUsersAsync(db);

        var service = CreateService(db);

        await service.CreateCollectorFarmerAsync(
            first.CollectorUserId,
            CreateRequest(first.FarmerUserId, "FARMER-001"),
            CancellationToken.None);

        await service.CreateCollectorFarmerAsync(
            second.CollectorUserId,
            CreateRequest(second.FarmerUserId, "FARMER-002"),
            CancellationToken.None);

        var result = await service.GetCollectorFarmersAsync(
            first.CollectorUserId,
            1,
            20,
            null,
            null,
            CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal("FARMER-001", result.Items[0].FarmerCode);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task CreateFarmer_DuplicateCodeIsRejected()
    {
        await using var db = CreateDatabase();

        var ids = await SeedUsersAsync(db);
        var anotherFarmer = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Another Farmer",
            PhoneNumber = "0771000003",
            PasswordHash = "test-hash",
            Role = UserRole.Farmer,
            IsActive = true
        };

        db.Users.Add(anotherFarmer);
        await db.SaveChangesAsync();

        var service = CreateService(db);

        await service.CreateCollectorFarmerAsync(
            ids.CollectorUserId,
            CreateRequest(ids.FarmerUserId, "FARMER-001"),
            CancellationToken.None);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateCollectorFarmerAsync(
                ids.CollectorUserId,
                CreateRequest(anotherFarmer.Id, "farmer-001"),
                CancellationToken.None));
    }

    [Fact]
    public async Task DeactivateFarmer_UpdatesFarmerAndUserStatus()
    {
        await using var db = CreateDatabase();

        var ids = await SeedUsersAsync(db);
        var service = CreateService(db);

        var farmer = await service.CreateCollectorFarmerAsync(
            ids.CollectorUserId,
            CreateRequest(ids.FarmerUserId),
            CancellationToken.None);

        var updated = await service.SetCollectorFarmerStatusAsync(
            ids.CollectorUserId,
            farmer.FarmerId,
            false,
            CancellationToken.None);

        var savedFarmer = await db.Farmers
            .Include(f => f.User)
            .SingleAsync(f => f.Id == farmer.FarmerId);

        Assert.True(updated);
        Assert.False(savedFarmer.IsActive);
        Assert.False(savedFarmer.User.IsActive);
    }

    [Fact]
    public async Task CreateFarmer_RejectsUserWithWrongRole()
    {
        await using var db = CreateDatabase();

        var ids = await SeedUsersAsync(db);
        var service = CreateService(db);

        await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCollectorFarmerAsync(
                ids.CollectorUserId,
                CreateRequest(ids.CollectorUserId),
                CancellationToken.None));
    }
}
