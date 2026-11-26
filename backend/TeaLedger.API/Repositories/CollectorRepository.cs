
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Repositories;

public sealed class CollectorRepository : ICollectorRepository
{
    private readonly ApplicationDbContext _db;

    public CollectorRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(IReadOnlyList<Collector> Items, int TotalCount)>
        GetPagedAsync(
            int page,
            int pageSize,
            string? search,
            string? area,
            bool? isActive,
            CancellationToken cancellationToken)
    {
        var query = _db.Collectors
            .AsNoTracking()
            .Include(c => c.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();

            query = query.Where(c =>
                c.CollectorCode.ToLower().Contains(term) ||
                c.User.FullName.ToLower().Contains(term) ||
                c.User.PhoneNumber.ToLower().Contains(term) ||
                (c.Area != null &&
                 c.Area.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(area))
        {
            var areaTerm = area.Trim().ToLower();

            query = query.Where(c =>
                c.Area != null &&
                c.Area.ToLower().Contains(areaTerm));
        }

        if (isActive.HasValue)
        {
            query = query.Where(
                c => c.User.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(c => c.User.FullName)
            .ThenBy(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<Collector?> GetByIdAsync(
        Guid id,
        bool tracking,
        CancellationToken cancellationToken)
    {
        IQueryable<Collector> query = _db.Collectors
            .Include(c => c.User)
            .Include(c => c.Farmers);

        if (!tracking)
        {
            query = query.AsNoTracking();
        }

        return query.FirstOrDefaultAsync(
            c => c.Id == id,
            cancellationToken);
    }

    public Task<Collector?> GetByUserIdAsync(
        Guid userId,
        bool tracking,
        CancellationToken cancellationToken)
    {
        IQueryable<Collector> query = _db.Collectors
            .Include(c => c.User)
            .Include(c => c.Farmers);

        if (!tracking)
        {
            query = query.AsNoTracking();
        }

        return query.FirstOrDefaultAsync(
            c => c.UserId == userId,
            cancellationToken);
    }

    public Task<bool> PhoneNumberExistsAsync(
        string phoneNumber,
        Guid? excludedUserId,
        CancellationToken cancellationToken)
    {
        var query = _db.Users.Where(
            u => u.PhoneNumber == phoneNumber);

        if (excludedUserId.HasValue)
        {
            query = query.Where(
                u => u.Id != excludedUserId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public Task<bool> CollectorCodeExistsAsync(
        string collectorCode,
        CancellationToken cancellationToken)
    {
        return _db.Collectors.AnyAsync(
            c => c.CollectorCode == collectorCode,
            cancellationToken);
    }

    public Task<int> GetAssignedFarmerCountAsync(
        Guid collectorId,
        CancellationToken cancellationToken)
    {
        return _db.Farmers.CountAsync(
            f => f.CollectorId == collectorId,
            cancellationToken);
    }

    public async Task AddAsync(
        Collector collector,
        CancellationToken cancellationToken)
    {
        await _db.Collectors.AddAsync(
            collector, cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
