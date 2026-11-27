using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Repositories;

public sealed class FarmerRepository : IFarmerRepository
{
    private readonly ApplicationDbContext _db;

    public FarmerRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(IReadOnlyList<Farmer> Items, int TotalCount)>
        GetPagedAsync(
            int page,
            int pageSize,
            string? search,
            bool? isActive,
            Guid? collectorId,
            CancellationToken cancellationToken)
    {
        IQueryable<Farmer> query = _db.Farmers
            .AsNoTracking()
            .Include(f => f.User);

        if (collectorId.HasValue)
        {
            query = query.Where(
                f => f.CollectorId == collectorId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(
                f => f.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();

            query = query.Where(f =>
                f.FarmerCode.ToLower().Contains(term) ||
                (f.Address != null &&
                 f.Address.ToLower().Contains(term)) ||
                f.User.FullName.ToLower().Contains(term) ||
                f.User.PhoneNumber.Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(f => f.User.FullName)
            .ThenBy(f => f.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Farmer?> GetByIdAsync(
        Guid farmerId,
        Guid? collectorId,
        bool tracking,
        CancellationToken cancellationToken)
    {
        IQueryable<Farmer> query = _db.Farmers
            .Include(f => f.User);

        if (!tracking)
        {
            query = query.AsNoTracking();
        }

        if (collectorId.HasValue)
        {
            query = query.Where(
                f => f.CollectorId == collectorId.Value);
        }

        return await query.FirstOrDefaultAsync(
            f => f.Id == farmerId,
            cancellationToken);
    }

    public Task<User?> GetUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return _db.Users.FirstOrDefaultAsync(
            u => u.Id == userId,
            cancellationToken);
    }

    public Task<Collector?> GetCollectorByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return _db.Collectors.FirstOrDefaultAsync(
            c => c.UserId == userId,
            cancellationToken);
    }

    public Task<bool> CollectorExistsAsync(
        Guid collectorId,
        CancellationToken cancellationToken)
    {
        return _db.Collectors.AnyAsync(
            c => c.Id == collectorId,
            cancellationToken);
    }

    public Task<bool> UserHasFarmerProfileAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return _db.Farmers.AnyAsync(
            f => f.UserId == userId,
            cancellationToken);
    }

    public Task<bool> FarmerCodeExistsAsync(
        string farmerCode,
        Guid? excludeFarmerId,
        CancellationToken cancellationToken)
    {
        var query = _db.Farmers.Where(
            f => f.FarmerCode.ToLower() == farmerCode.ToLower());

        if (excludeFarmerId.HasValue)
        {
            query = query.Where(
                f => f.Id != excludeFarmerId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(
        Farmer farmer,
        CancellationToken cancellationToken)
    {
        await _db.Farmers.AddAsync(farmer, cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
