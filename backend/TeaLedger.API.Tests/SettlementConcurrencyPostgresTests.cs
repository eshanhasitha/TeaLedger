using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Settlements;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

[Collection("PostgreSQL integration")]
public sealed class SettlementConcurrencyPostgresTests
{
    [Fact]
    public async Task ConcurrentCreateAsync_OnlyCreatesOneSettlementForFarmerMonth()
    {
        var connectionString = Environment.GetEnvironmentVariable(
            "TEALEDGER_TEST_POSTGRES");
        if (string.IsNullOrWhiteSpace(connectionString))
            return;

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;
        var farmerUserId = Guid.NewGuid();
        var farmerId = Guid.NewGuid();
        var farmerCode = $"CONCURRENCY-{farmerId:N}";
        var phoneNumber = $"+test-{farmerUserId:N}";
        var detailsPattern = $"%{farmerId}%";
        var year = DateTime.UtcNow.Year;
        var month = DateTime.UtcNow.Month;

        await using (var setup = new ApplicationDbContext(options))
        {
            await setup.Database.MigrateAsync();
            setup.Users.Add(new User
            {
                Id = farmerUserId,
                FullName = "Settlement Concurrency Test",
                PhoneNumber = phoneNumber,
                PasswordHash = "test",
                Role = UserRole.Farmer
            });
            setup.Farmers.Add(new Farmer
            {
                Id = farmerId,
                UserId = farmerUserId,
                FarmerCode = farmerCode
            });
            await setup.SaveChangesAsync();
        }

        try
        {
            async Task<Exception?> CreateAttemptAsync()
            {
                try
                {
                    await using var db = new ApplicationDbContext(options);
                    await new SettlementService(db).CreateAsync(
                        Guid.NewGuid(),
                        new CreateSettlementDto
                        {
                            FarmerId = farmerId,
                            Year = year,
                            Month = month
                        },
                        CancellationToken.None);
                    return null;
                }
                catch (Exception exception)
                {
                    return exception;
                }
            }

            var attempts = await Task.WhenAll(
                CreateAttemptAsync(),
                CreateAttemptAsync());

            Assert.Single(attempts, exception => exception is null);
            Assert.Single(attempts, exception =>
                exception is InvalidOperationException);

            await using var verify = new ApplicationDbContext(options);
            Assert.Equal(1, await verify.Settlements.CountAsync(x =>
                x.FarmerId == farmerId && x.Year == year && x.Month == month));
        }
        finally
        {
            await using var cleanup = new ApplicationDbContext(options);
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"ActivityLogs\" WHERE \"Details\" LIKE {detailsPattern}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"Settlements\" WHERE \"FarmerId\" = {farmerId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"Farmers\" WHERE \"Id\" = {farmerId}");
            await cleanup.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM \"Users\" WHERE \"Id\" = {farmerUserId}");
        }
    }
}
