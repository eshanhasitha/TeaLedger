using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Authorization;
using TeaLedger.API.Data;
using TeaLedger.API.Models;

namespace TeaLedger.API.Tests;

public sealed class ResourceOwnershipTests
{
    [Fact]
    public async Task FarmerOwnership_RequiresMatchingUserAndFarmer()
    {
        await using var db = CreateDb();
        var farmerUser = AddUser(db, UserRole.Farmer, "farmer-owner");
        var otherFarmerUser = AddUser(db, UserRole.Farmer, "farmer-other");
        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = farmerUser.Id,
            FarmerCode = "OWN-FARMER",
            User = farmerUser
        };
        db.Farmers.Add(farmer);
        await db.SaveChangesAsync();

        Assert.True(await ResourceOwnership.FarmerOwnsResourceAsync(
            db, farmerUser.Id, farmer.Id));
        Assert.False(await ResourceOwnership.FarmerOwnsResourceAsync(
            db, otherFarmerUser.Id, farmer.Id));
        Assert.False(await ResourceOwnership.FarmerOwnsResourceAsync(
            db, farmerUser.Id, Guid.Empty));
    }

    [Fact]
    public async Task CollectorOwnership_RequiresAssignedCollector()
    {
        await using var db = CreateDb();
        var collectorUser = AddUser(db, UserRole.Collector, "collector-owner");
        var otherCollectorUser = AddUser(db, UserRole.Collector, "collector-other");
        var farmerUser = AddUser(db, UserRole.Farmer, "farmer-assigned");
        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = collectorUser.Id,
            CollectorCode = "OWN-COLLECTOR",
            User = collectorUser
        };
        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = farmerUser.Id,
            CollectorId = collector.Id,
            FarmerCode = "ASSIGNED-FARMER",
            Collector = collector,
            User = farmerUser
        };
        db.Collectors.Add(collector);
        db.Farmers.Add(farmer);
        await db.SaveChangesAsync();

        Assert.True(await ResourceOwnership.CollectorOwnsFarmerAsync(
            db, collectorUser.Id, farmer.Id));
        Assert.False(await ResourceOwnership.CollectorOwnsFarmerAsync(
            db, otherCollectorUser.Id, farmer.Id));
        Assert.False(await ResourceOwnership.CollectorOwnsFarmerAsync(
            db, collectorUser.Id, Guid.Empty));
    }

    private static ApplicationDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private static User AddUser(
        ApplicationDbContext db,
        UserRole role,
        string phone)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = phone,
            PhoneNumber = phone,
            PasswordHash = "test",
            Role = role
        };
        db.Users.Add(user);
        return user;
    }
}
