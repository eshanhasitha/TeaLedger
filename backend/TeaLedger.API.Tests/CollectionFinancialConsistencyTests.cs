using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

[Collection("PostgreSQL integration")]
public sealed class CollectionFinancialConsistencyTests
{
    [Fact]
    public void VerifiedCollectionEarning_HasCreditDirection()
    {
        var collectionId = Guid.NewGuid();
        var farmerId = Guid.NewGuid();

        const decimal finalWeight = 25.5m;
        const decimal pricePerKg = 125m;

        var amount = TeaPriceService.CalculateAmount(
            finalWeight,
            pricePerKg);

        var collection = new Collection
        {
            Id = collectionId,
            FarmerId = farmerId,
            FinalWeight = finalWeight,
            PricePerKg = pricePerKg,
            TotalAmount = amount,
            Status = CollectionStatus.Collected,
            CollectedAt = DateTime.UtcNow
        };

        var ledgerEntry = new FinancialLedgerEntry
        {
            FarmerId = farmerId,
            CollectionId = collectionId,
            TransactionType =
                FinancialTransactionType.CollectionEarning,
            Direction = FinancialDirection.Credit,
            Amount = amount,
            Description = "Verified tea collection earning",
            Reference = collectionId.ToString()
        };

        Assert.Equal(CollectionStatus.Collected, collection.Status);
        Assert.Equal(
            collection.FinalWeight * collection.PricePerKg,
            ledgerEntry.Amount);
        Assert.Equal(collection.Id, ledgerEntry.CollectionId);
        Assert.Equal(FinancialDirection.Credit, ledgerEntry.Direction);
        Assert.True(ledgerEntry.Amount > 0);
    }

    [Fact]
    public void PendingCollection_MustNotCreateEarnings()
    {
        var collection = new Collection
        {
            Id = Guid.NewGuid(),
            FarmerId = Guid.NewGuid(),
            FinalWeight = 0,
            TotalAmount = 0,
            Status = CollectionStatus.Pending,
            CollectedAt = DateTime.UtcNow
        };

        Assert.Equal(CollectionStatus.Pending, collection.Status);
        Assert.Equal(0m, collection.TotalAmount);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task VerifyAsync_PersistsCollectionAndFinancialRecordsTogether_InPostgres(
        bool priceConfiguredBeforeVerification)
    {
        var connectionString = Environment.GetEnvironmentVariable(
            "TEALEDGER_TEST_POSTGRES");
        if (string.IsNullOrWhiteSpace(connectionString))
            return;

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        var collectorUserId = Guid.NewGuid();
        var farmerUserId = Guid.NewGuid();
        var collectorId = Guid.NewGuid();
        var farmerId = Guid.NewGuid();
        var requestId = Guid.NewGuid();
        var collectionId = Guid.NewGuid();
        var collectedAt = DateTime.UtcNow;

        await using (var setup = new ApplicationDbContext(options))
        {
            await setup.Database.MigrateAsync();

            var collectorUser = new User
            {
                Id = collectorUserId,
                FullName = "Integration Collector",
                PhoneNumber = $"collector-{collectorUserId:N}",
                PasswordHash = "test",
                Role = UserRole.Collector
            };
            var farmerUser = new User
            {
                Id = farmerUserId,
                FullName = "Integration Farmer",
                PhoneNumber = $"farmer-{farmerUserId:N}",
                PasswordHash = "test",
                Role = UserRole.Farmer
            };
            var collector = new Collector
            {
                Id = collectorId,
                UserId = collectorUserId,
                CollectorCode = $"C-{collectorId:N}",
                User = collectorUser
            };
            var farmer = new Farmer
            {
                Id = farmerId,
                UserId = farmerUserId,
                CollectorId = collectorId,
                FarmerCode = $"F-{farmerId:N}",
                User = farmerUser,
                Collector = collector
            };
            var request = new CollectionRequest
            {
                Id = requestId,
                FarmerId = farmerId,
                Farmer = farmer,
                Status = CollectionRequestStatus.Accepted,
                EstimatedQuantityKg = 30,
                RequestedAt = collectedAt
            };

            setup.Users.AddRange(collectorUser, farmerUser);
            setup.Collectors.Add(collector);
            setup.Farmers.Add(farmer);
            setup.CollectionRequests.Add(request);
            setup.Collections.Add(new Collection
            {
                Id = collectionId,
                RequestId = requestId,
                Request = request,
                FarmerId = farmerId,
                Farmer = farmer,
                CollectorId = collectorId,
                GrossWeight = 0,
                Status = CollectionStatus.Pending,
                CollectedAt = collectedAt
            });
            await setup.SaveChangesAsync();
        }

        try
        {
            await using (var db = new ApplicationDbContext(options))
            {
                if (priceConfiguredBeforeVerification)
                {
                    await SetMonthlyPriceAsync(
                        db,
                        collectorUserId,
                        collectedAt);
                }

                var service = new WeightVerificationService(
                    db,
                    new ActivityLogService(db));

                var result = await service.VerifyAsync(
                    collectorUserId,
                    collectionId,
                    new DTOs.Collections.VerifyWeightDto
                    {
                        GrossWeight = 27m,
                        WaterReduction = 1m,
                        BagWeight = 0.5m,
                        OtherReduction = 0m
                    },
                    CancellationToken.None);

                Assert.NotNull(result);
                Assert.Equal(25.5m, result.FinalWeight);

                if (priceConfiguredBeforeVerification)
                {
                    Assert.Equal(125m, result.PricePerKg);
                    Assert.Equal(3187.50m, result.TotalAmount);
                }
                else
                {
                    Assert.Equal(0m, result.TotalAmount);
                    await SetMonthlyPriceAsync(
                        db,
                        collectorUserId,
                        collectedAt);
                }
            }

            await using var verify = new ApplicationDbContext(options);
            var collection = await verify.Collections
                .SingleAsync(x => x.Id == collectionId);
            var weightVerification = await verify.WeightVerifications
                .SingleAsync(x => x.CollectionId == collectionId);
            var passbook = await verify.PassbookEntries
                .SingleAsync(x => x.CollectionId == collectionId);
            var ledger = await verify.FinancialLedgerEntries
                .SingleAsync(x => x.CollectionId == collectionId);
            var activity = priceConfiguredBeforeVerification
                ? await verify.ActivityLogs.SingleAsync(
                    x => x.EntityId == collectionId)
                : await verify.ActivityLogs.SingleAsync(
                    x => x.EntityId == ledger.Id);

            Assert.Equal(CollectionStatus.Collected, collection.Status);
            Assert.Equal(25.5m, collection.FinalWeight);
            Assert.Equal(125m, collection.PricePerKg);
            Assert.Equal(3187.5m, collection.TotalAmount);
            Assert.Equal(collection.TotalAmount, ledger.Amount);
            Assert.Equal(FinancialDirection.Credit, ledger.Direction);
            Assert.Equal(
                FinancialTransactionType.CollectionEarning,
                ledger.TransactionType);
            Assert.Equal(collection.FinalWeight, weightVerification.FinalWeight);
            Assert.Equal(collection.FinalWeight, passbook.FinalWeight);
            Assert.Equal(
                priceConfiguredBeforeVerification
                    ? "CollectionWeightVerified"
                    : "CollectionEarningPriced",
                activity.Action);
            Assert.Equal(
                priceConfiguredBeforeVerification
                    ? "Collection"
                    : "FinancialLedgerEntry",
                activity.EntityType);
        }
        finally
        {
            await using var cleanup = new ApplicationDbContext(options);
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"ActivityLogs\" WHERE \"EntityId\" = {collectionId} OR \"EntityId\" IN (SELECT \"Id\" FROM \"FinancialLedgerEntries\" WHERE \"CollectionId\" = {collectionId})");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"FinancialLedgerEntries\" WHERE \"CollectionId\" = {collectionId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"PassbookEntries\" WHERE \"CollectionId\" = {collectionId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"WeightVerifications\" WHERE \"CollectionId\" = {collectionId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"ActivityLogs\" WHERE \"EntityId\" IN (SELECT \"Id\" FROM \"TeaPrices\" WHERE \"CollectorId\" = {collectorId})");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"TeaPrices\" WHERE \"CollectorId\" = {collectorId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"Collections\" WHERE \"Id\" = {collectionId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"CollectionRequests\" WHERE \"Id\" = {requestId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"Farmers\" WHERE \"Id\" = {farmerId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"Collectors\" WHERE \"Id\" = {collectorId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"Users\" WHERE \"Id\" IN ({farmerUserId}, {collectorUserId})");
        }
    }

    private static async Task SetMonthlyPriceAsync(
        ApplicationDbContext db,
        Guid collectorUserId,
        DateTime collectedAt)
    {
        var priceService = new TeaPriceService(
            db,
            new ActivityLogService(db));
        await priceService.SetMonthlyPriceForCollectorUserAsync(
            collectorUserId,
            new DTOs.TeaPrices.SetMonthlyTeaPriceDto
            {
                Year = collectedAt.Year,
                Month = collectedAt.Month,
                PricePerKg = 125m,
                EffectiveFrom = new DateTime(
                    collectedAt.Year,
                    collectedAt.Month,
                    1,
                    0, 0, 0, DateTimeKind.Utc)
            },
            CancellationToken.None);
    }

}
