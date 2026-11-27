
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class EarningsServiceIntegrationTests
{
    [Fact]
    public async Task DailyEarnings_OnlyIncludesVerifiedCollections()
    {
        var options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

        await using var db = new ApplicationDbContext(options);

        var farmerUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Integration Farmer",
            PhoneNumber = "0779000001",
            PasswordHash = "test",
            Role = UserRole.Farmer,
            IsActive = true
        };

        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = farmerUser.Id,
            FarmerCode = "FAR-INTEGRATION",
            IsActive = true,
            User = farmerUser
        };

        var request = new CollectionRequest
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            Farmer = farmer,
            Status = CollectionRequestStatus.Collected,
            EstimatedQuantityKg = 20,
            RequestedAt = DateTime.UtcNow
        };

        var today = DateTime.UtcNow.Date;

        var verifiedCollection = new Collection
        {
            Id = Guid.NewGuid(),
            RequestId = request.Id,
            Request = request,
            FarmerId = farmer.Id,
            Farmer = farmer,
            GrossWeight = 12,
            WaterReduction = 1,
            BagWeight = 0.5m,
            OtherReduction = 0,
            FinalWeight = 10.5m,
            PricePerKg = 120,
            TotalAmount = 1260,
            Status = CollectionStatus.Collected,
            CollectedAt = today.AddHours(10),
            CreatedAt = today,
            UpdatedAt = today
        };

        var pendingRequest = new CollectionRequest
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            Farmer = farmer,
            Status = CollectionRequestStatus.Collected,
            EstimatedQuantityKg = 15,
            RequestedAt = DateTime.UtcNow
        };

        var pendingCollection = new Collection
        {
            Id = Guid.NewGuid(),
            RequestId = pendingRequest.Id,
            Request = pendingRequest,
            FarmerId = farmer.Id,
            Farmer = farmer,
            GrossWeight = 0,
            WaterReduction = 0,
            BagWeight = 0,
            OtherReduction = 0,
            FinalWeight = 0,
            PricePerKg = 0,
            TotalAmount = 0,
            Status = CollectionStatus.Pending,
            CollectedAt = today.AddHours(11),
            CreatedAt = today,
            UpdatedAt = today
        };

        db.Users.Add(farmerUser);
        db.Farmers.Add(farmer);
        db.CollectionRequests.AddRange(request, pendingRequest);
        db.Collections.AddRange(
            verifiedCollection,
            pendingCollection);

        await db.SaveChangesAsync();

        var service = new EarningsService(db);

        var result = await service.GetDailyEarningsAsync(
            farmerUser.Id,
            DateOnly.FromDateTime(today),
            CancellationToken.None);

        Assert.Equal(1, result.CollectionCount);
        Assert.Equal(10.5m, result.TotalWeightKg);
        Assert.Equal(1260m, result.TotalEarnings);
    }
}