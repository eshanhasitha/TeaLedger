
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Collectors;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;
using TeaLedger.API.Repositories;
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class CollectorServiceTests
{
    private static ApplicationDbContext CreateDatabase()
    {
        var options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

        return new ApplicationDbContext(options);
    }

    private static CollectorService CreateService(
        ApplicationDbContext db)
    {
        return new CollectorService(
            new CollectorRepository(db),
            new TestPasswordService(),
            NullLogger<CollectorService>.Instance);
    }

    private static async Task<(User User, Collector Collector)>
        SeedCollectorAsync(ApplicationDbContext db)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Collector",
            PhoneNumber = "0771234567",
            PasswordHash = "test-hash",
            Role = UserRole.Collector,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CollectorCode = "COL-TEST01",
            Area = "Ratnapura",
            CreatedAt = DateTime.UtcNow,
            User = user
        };

        db.Users.Add(user);
        db.Collectors.Add(collector);

        await db.SaveChangesAsync();

        return (user, collector);
    }

    [Fact]
    public async Task GetMyProfile_ReturnsAuthenticatedCollectorsProfile()
    {
        await using var db = CreateDatabase();

        var seeded = await SeedCollectorAsync(db);
        var service = CreateService(db);

        var result = await service.GetMyProfileAsync(
            seeded.User.Id,
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(seeded.Collector.Id, result.Id);
        Assert.Equal(seeded.User.Id, result.UserId);
        Assert.Equal("Ratnapura", result.Area);
        Assert.Equal("Test Collector", result.FullName);
    }

    [Fact]
    public async Task UpdateMyProfile_UpdatesCollectorArea()
    {
        await using var db = CreateDatabase();

        var seeded = await SeedCollectorAsync(db);
        var service = CreateService(db);

        var request = new UpdateCollectorDto
        {
            FullName = "Updated Collector",
            PhoneNumber = "0771234567",
            Area = "Galle"
        };

        var result = await service.UpdateMyProfileAsync(
            seeded.User.Id,
            request,
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Galle", result.Area);
        Assert.Equal("Updated Collector", result.FullName);
    }

    [Fact]
    public async Task SearchCollectors_FiltersByArea()
    {
        await using var db = CreateDatabase();

        var first = await SeedCollectorAsync(db);

        var secondUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Second Collector",
            PhoneNumber = "0777654321",
            PasswordHash = "test-hash",
            Role = UserRole.Collector,
            IsActive = true
        };

        var secondCollector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = secondUser.Id,
            CollectorCode = "COL-TEST02",
            Area = "Galle",
            User = secondUser
        };

        db.Users.Add(secondUser);
        db.Collectors.Add(secondCollector);
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var result = await service.SearchCollectorsAsync(
            1,
            20,
            null,
            "Ratnapura",
            null,
            CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(first.Collector.Id, result.Items[0].Id);
    }

    [Fact]
    public async Task UpdateMyProfile_DoesNotUpdateAnotherCollector()
    {
        await using var db = CreateDatabase();

        var first = await SeedCollectorAsync(db);

        var service = CreateService(db);

        var request = new UpdateCollectorDto
        {
            FullName = "Changed Name",
            PhoneNumber = "0771234567",
            Area = "Galle"
        };

        var result = await service.UpdateMyProfileAsync(
            Guid.NewGuid(),
            request,
            CancellationToken.None);

        Assert.Null(result);

        var unchanged = await db.Collectors
            .Include(c => c.User)
            .SingleAsync(c => c.Id == first.Collector.Id);

        Assert.Equal("Test Collector", unchanged.User.FullName);
        Assert.Equal("Ratnapura", unchanged.Area);
    }

    [Fact]
    public async Task UpdateMyProfile_RejectsDuplicatePhoneNumber()
    {
        await using var db = CreateDatabase();

        var first = await SeedCollectorAsync(db);

        var secondUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Second Collector",
            PhoneNumber = "0777654321",
            PasswordHash = "test-hash",
            Role = UserRole.Collector,
            IsActive = true
        };

        var secondCollector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = secondUser.Id,
            CollectorCode = "COL-TEST02",
            User = secondUser
        };

        db.Users.Add(secondUser);
        db.Collectors.Add(secondCollector);
        await db.SaveChangesAsync();

        var service = CreateService(db);

        var request = new UpdateCollectorDto
        {
            FullName = "Test Collector",
            PhoneNumber = "0777654321",
            Area = "Ratnapura"
        };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.UpdateMyProfileAsync(
                first.User.Id,
                request,
                CancellationToken.None));
    }

    [Fact]
    public async Task CreateCollector_RejectsInvalidArea()
    {
        await using var db = CreateDatabase();

        var service = CreateService(db);

        var request = new CreateCollectorDto
        {
            FullName = "New Collector",
            PhoneNumber = "0779999999",
            Password = "TestPassword123!",
            Area = "A"
        };

        await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCollectorAsync(
                request,
                CancellationToken.None));
    }

    private sealed class TestPasswordService : IPasswordService
    {
        public bool IsValidPassword(string password)
        {
            return !string.IsNullOrWhiteSpace(password)
                && password.Length >= 8;
        }

        public string HashPassword(string password)
        {
            return "TEST-HASH-" + password;
        }

        public bool VerifyPassword(
            string password,
            string passwordHash)
        {
            return passwordHash == "TEST-HASH-" + password;
        }
    }
}
