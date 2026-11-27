
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Settlements;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class SettlementServiceTests
{
    [Fact]
    public async Task CreateAsync_RejectsDuplicateFarmerMonth()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(
                InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        await using var db = new ApplicationDbContext(options);
        var farmerUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Settlement Farmer",
            PhoneNumber = "0777000001",
            PasswordHash = "test",
            Role = UserRole.Farmer
        };
        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = farmerUser.Id,
            FarmerCode = "SETTLEMENT-FARMER",
            User = farmerUser
        };
        db.Users.Add(farmerUser);
        db.Farmers.Add(farmer);
        await db.SaveChangesAsync();

        var settlementIndexes = db.Model
            .FindEntityType(typeof(Settlement))!
            .GetIndexes();
        var monthlyUniqueIndex = Assert.Single(
            settlementIndexes,
            index => index.IsUnique &&
                index.Properties.Select(property => property.Name)
                    .SequenceEqual([
                        nameof(Settlement.FarmerId),
                        nameof(Settlement.Year),
                        nameof(Settlement.Month)]));
        Assert.True(monthlyUniqueIndex.IsUnique);

        var service = new SettlementService(db);
        var input = new CreateSettlementDto
        {
            FarmerId = farmer.Id,
            Year = 2026,
            Month = 10
        };

        await service.CreateAsync(Guid.NewGuid(), input, CancellationToken.None);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateAsync(Guid.NewGuid(), input, CancellationToken.None));
        Assert.Equal(1, await db.Settlements.CountAsync());
    }

    [Fact]
    public async Task FarmerSettlementQueries_AreScopedToAuthenticatedFarmer()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var db = new ApplicationDbContext(options);
        var firstUser = CreateFarmerUser("0777000011");
        var secondUser = CreateFarmerUser("0777000012");
        var collectorUser = new User
        {
            Id = Guid.NewGuid(), FullName = "Owner collector",
            PhoneNumber = "0777000013", PasswordHash = "test",
            Role = UserRole.Collector
        };
        var otherCollectorUser = new User
        {
            Id = Guid.NewGuid(), FullName = "Other collector",
            PhoneNumber = "0777000014", PasswordHash = "test",
            Role = UserRole.Collector
        };
        var collector = new Collector
        {
            Id = Guid.NewGuid(), UserId = collectorUser.Id,
            CollectorCode = "SETTLE-C1", User = collectorUser
        };
        var otherCollector = new Collector
        {
            Id = Guid.NewGuid(), UserId = otherCollectorUser.Id,
            CollectorCode = "SETTLE-C2", User = otherCollectorUser
        };
        var firstFarmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = firstUser.Id,
            CollectorId = collector.Id,
            FarmerCode = "OWNER-FIRST",
            User = firstUser,
            Collector = collector
        };
        var secondFarmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = secondUser.Id,
            CollectorId = otherCollector.Id,
            FarmerCode = "OWNER-SECOND",
            User = secondUser,
            Collector = otherCollector
        };
        db.Users.AddRange(firstUser, secondUser, collectorUser, otherCollectorUser);
        db.Collectors.AddRange(collector, otherCollector);
        db.Farmers.AddRange(firstFarmer, secondFarmer);
        db.Settlements.AddRange(
            CreateSettlement(firstFarmer.Id),
            CreateSettlement(secondFarmer.Id));
        await db.SaveChangesAsync();

        var service = new SettlementService(db);
        var firstRows = await service.GetFarmerSettlementsAsync(
            firstUser.Id, CancellationToken.None);
        var secondSettlementId = await db.Settlements
            .Where(x => x.FarmerId == secondFarmer.Id)
            .Select(x => x.Id)
            .SingleAsync();

        Assert.Single(firstRows);
        Assert.Single(await service.GetCollectorSettlementsAsync(
            collectorUser.Id, CancellationToken.None));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.GetCollectorSettlementsAsync(
                Guid.NewGuid(), CancellationToken.None));
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.GetFarmerSettlementAsync(
                firstUser.Id,
                secondSettlementId,
                CancellationToken.None));
    }

    private static User CreateFarmerUser(string phone) => new()
    {
        Id = Guid.NewGuid(),
        FullName = phone,
        PhoneNumber = phone,
        PasswordHash = "test",
        Role = UserRole.Farmer
    };

    private static Settlement CreateSettlement(Guid farmerId) => new()
    {
        Id = Guid.NewGuid(),
        FarmerId = farmerId,
        Year = 2026,
        Month = 10,
        PeriodStart = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
        PeriodEnd = new DateTime(2026, 10, 31, 23, 59, 59, DateTimeKind.Utc),
        Status = SettlementStatus.Draft
    };

    [Fact]
    public void CalculateNetSettlement_SubtractsDeductionsAndRepayments()
    {
        var result = SettlementService.CalculateNetSettlement(
            50000m,
            5000m,
            10000m);

        Assert.Equal(35000m, result);
    }

    [Fact]
    public void CalculateNetSettlement_AllowsNoDeductions()
    {
        var result = SettlementService.CalculateNetSettlement(
            25000m,
            0m,
            0m);

        Assert.Equal(25000m, result);
    }

    [Fact]
    public void CalculateNetSettlement_AllowsZeroNetAmount()
    {
        var result = SettlementService.CalculateNetSettlement(
            15000m,
            10000m,
            5000m);

        Assert.Equal(0m, result);
    }

    [Fact]
    public void CalculateNetSettlement_RoundsToTwoDecimalPlaces()
    {
        var result = SettlementService.CalculateNetSettlement(
            1000.999m,
            100.111m,
            50.111m);

        Assert.Equal(850.78m, result);
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeIncome()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(
                -100m, 0m, 0m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeDeduction()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(
                1000m, -10m, 0m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeRepayment()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(
                1000m, 0m, -10m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeResult()
    {
        Assert.Throws<InvalidOperationException>(() =>
            SettlementService.CalculateNetSettlement(
                1000m, 700m, 400m));
    }
}
