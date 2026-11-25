using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.Models;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests.Services;

public sealed class ReportServiceTests
{
    private static ApplicationDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Collections_InvalidDateRange_ThrowsArgumentException()
    {
        await using var db = CreateDb();
        var service = new ReportService(db);

        var from = new DateOnly(2026, 10, 31);
        var to = new DateOnly(2026, 10, 1);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.GetCollectionsAsync(
                from, to, null, null, 1, 20, CancellationToken.None));
    }

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 0)]
    [InlineData(1, 101)]
    public async Task Collections_InvalidPaging_ThrowsArgumentException(
        int page,
        int pageSize)
    {
        await using var db = CreateDb();
        var service = new ReportService(db);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.GetCollectionsAsync(
                null, null, null, null,
                page, pageSize, CancellationToken.None));
    }

    [Fact]
    public async Task FarmerLookup_UnknownUser_ReturnsNull()
    {
        await using var db = CreateDb();
        var service = new ReportService(db);

        var result = await service.GetFarmerIdForUserAsync(
            Guid.NewGuid(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task CollectorLookup_UnknownUser_ReturnsNull()
    {
        await using var db = CreateDb();
        var service = new ReportService(db);

        var result = await service.GetCollectorIdForUserAsync(
            Guid.NewGuid(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task EarningsReport_ContainsOnlyCollectionEarningCredits()
    {
        await using var db = CreateDb();
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Report Farmer",
            PhoneNumber = "0776000001",
            PasswordHash = "test",
            Role = UserRole.Farmer
        };
        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            FarmerCode = "REPORT-FARMER",
            User = user
        };
        var when = new DateTime(2026, 10, 15, 12, 0, 0, DateTimeKind.Utc);

        db.Users.Add(user);
        db.Farmers.Add(farmer);
        db.FinancialLedgerEntries.AddRange(
            new FinancialLedgerEntry
            {
                FarmerId = farmer.Id,
                Farmer = farmer,
                TransactionType = FinancialTransactionType.CollectionEarning,
                Direction = FinancialDirection.Credit,
                Amount = 1_250m,
                Description = "Collection earnings",
                OccurredAt = when
            },
            new FinancialLedgerEntry
            {
                FarmerId = farmer.Id,
                Farmer = farmer,
                TransactionType = FinancialTransactionType.CollectionEarning,
                Direction = FinancialDirection.Debit,
                Amount = 50m,
                Description = "Invalid earning direction",
                OccurredAt = when
            },
            new FinancialLedgerEntry
            {
                FarmerId = farmer.Id,
                Farmer = farmer,
                TransactionType = FinancialTransactionType.LoanDisbursement,
                Direction = FinancialDirection.Credit,
                Amount = 500m,
                Description = "Loan disbursement",
                OccurredAt = when
            });
        await db.SaveChangesAsync();

        var result = await new ReportService(db).GetEarningsAsync(
            new DateOnly(2026, 10, 1),
            new DateOnly(2026, 10, 31),
            farmer.Id,
            1,
            20,
            CancellationToken.None);

        var row = Assert.Single(result.Items);
        Assert.Equal(1_250m, row.Amount);
        Assert.Equal(1, result.TotalCount);
    }
}
