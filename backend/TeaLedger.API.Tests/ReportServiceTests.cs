using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
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
}