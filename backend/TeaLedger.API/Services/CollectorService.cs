using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Collectors;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class CollectorService : ICollectorService
{
    private readonly ApplicationDbContext _db;
    private readonly IPasswordService _passwordService;

    public CollectorService(
        ApplicationDbContext db,
        IPasswordService passwordService)
    {
        _db = db;
        _passwordService = passwordService;
    }

    public async Task<(IReadOnlyList<CollectorDto> Items, int TotalCount)>
        GetCollectorsAsync(
            int page,
            int pageSize,
            string? search,
            bool? isActive,
            CancellationToken cancellationToken)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Collectors
            .AsNoTracking()
            .Include(c => c.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(c =>
                c.CollectorCode.Contains(term) ||
                c.User.FullName.Contains(term) ||
                c.User.PhoneNumber.Contains(term));
        }

        if (isActive.HasValue)
        {
            query = query.Where(c => c.User.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var collectors = await query
            .OrderBy(c => c.User.FullName)
            .ThenBy(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (collectors.Select(MapToDto).ToList(), totalCount);
    }

    public async Task<CollectorDto?> GetCollectorByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var collector = await _db.Collectors
            .AsNoTracking()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        return collector is null ? null : MapToDto(collector);
    }

    public async Task<CollectorDto> CreateCollectorAsync(
        CreateCollectorDto request,
        CancellationToken cancellationToken)
    {
        var fullName = request.FullName.Trim();
        var phoneNumber = NormalizePhone(request.PhoneNumber);

        if (!_passwordService.IsValidPassword(request.Password))
        {
            throw new ArgumentException(
                "Password must satisfy the application's password policy.");
        }

        var phoneExists = await _db.Users.AnyAsync(
            u => u.PhoneNumber == phoneNumber,
            cancellationToken);

        if (phoneExists)
        {
            throw new InvalidOperationException(
                "This phone number is already registered.");
        }

        var now = DateTime.UtcNow;

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            PhoneNumber = phoneNumber,
            PasswordHash = _passwordService.HashPassword(request.Password),
            Role = UserRole.Collector,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CollectorCode = GenerateCollectorCode(),
            Area = NormalizeOptional(request.Address),
            CreatedAt = now,
            User = user
        };

        await using var transaction =
            await _db.Database.BeginTransactionAsync(cancellationToken);

        _db.Users.Add(user);
        _db.Collectors.Add(collector);

        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapToDto(collector);
    }

    public async Task<CollectorDto?> UpdateCollectorAsync(
        Guid id,
        UpdateCollectorDto request,
        CancellationToken cancellationToken)
    {
        var collector = await _db.Collectors
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (collector is null)
        {
            return null;
        }

        var phoneNumber = NormalizePhone(request.PhoneNumber);

        var phoneExists = await _db.Users.AnyAsync(
            u => u.Id != collector.UserId &&
                 u.PhoneNumber == phoneNumber,
            cancellationToken);

        if (phoneExists)
        {
            throw new InvalidOperationException(
                "This phone number is already registered.");
        }

        collector.User.FullName = request.FullName.Trim();
        collector.User.PhoneNumber = phoneNumber;
        collector.User.UpdatedAt = DateTime.UtcNow;
        collector.Area = NormalizeOptional(request.Address);

        await _db.SaveChangesAsync(cancellationToken);

        return MapToDto(collector);
    }

    public async Task<bool> SetCollectorStatusAsync(
        Guid id,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var collector = await _db.Collectors
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (collector is null)
        {
            return false;
        }

        collector.User.IsActive = isActive;
        collector.User.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static CollectorDto MapToDto(Collector collector)
    {
        return new CollectorDto
        {
            Id = collector.Id,
            UserId = collector.UserId,
            CollectorCode = collector.CollectorCode,
            FullName = collector.User.FullName,
            PhoneNumber = collector.User.PhoneNumber,
            Address = collector.Area,
            IsActive = collector.User.IsActive,
            CreatedAt = collector.CreatedAt
        };
    }

    private static string GenerateCollectorCode() =>
        $"COL-{Guid.NewGuid():N}"[..10].ToUpperInvariant();

    private static string NormalizePhone(string value) =>
        value.Trim().Replace(" ", string.Empty).Replace("-", string.Empty);

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
