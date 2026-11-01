using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Collections;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public class CollectionService : ICollectionService
{
    private readonly ApplicationDbContext _db;

    public CollectionService(ApplicationDbContext db) => _db = db;

    public async Task<CollectionDto> CreateAsync(Guid collectorUserId, CreateCollectionDto input, CancellationToken ct)
    {
        var collector = await _db.Collectors.SingleOrDefaultAsync(x => x.UserId == collectorUserId, ct)
            ?? throw new UnauthorizedAccessException("Collector profile not found.");

        var request = await _db.CollectionRequests
            .Include(x => x.Farmer).ThenInclude(x => x.User)
            .SingleOrDefaultAsync(x => x.Id == input.RequestId && x.Farmer.CollectorId == collector.Id, ct)
            ?? throw new InvalidOperationException("Request was not found for this collector.");

        if (request.Status != CollectionRequestStatus.Accepted)
            throw new InvalidOperationException("Only accepted requests can be collected.");
        if (!request.Farmer.IsActive || !request.Farmer.User.IsActive)
            throw new InvalidOperationException("Farmer account is inactive.");
        if (await _db.Collections.AnyAsync(x => x.RequestId == request.Id, ct))
            throw new InvalidOperationException("A collection already exists for this request.");

        var now = input.CollectedAt?.ToUniversalTime() ?? DateTime.UtcNow;
        var collection = new Collection
        {
            Id = Guid.NewGuid(), RequestId = request.Id, FarmerId = request.FarmerId,
            CollectorId = collector.Id, GrossWeight = 0, WaterReduction = 0,
            BagWeight = 0, OtherReduction = 0, FinalWeight = 0,
            PricePerKg = 0, TotalAmount = 0, Status = CollectionStatus.Pending,
            CollectedAt = now, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };

        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        _db.Collections.Add(collection);
        request.Status = CollectionRequestStatus.Collected;
        request.RespondedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Map(collection, request.Farmer);
    }

    public async Task<IReadOnlyList<CollectionDto>> FarmerHistoryAsync(Guid farmerUserId, DateTime? from, DateTime? to, CancellationToken ct)
    {
        var query = _db.Collections.AsNoTracking().Include(x => x.Farmer).ThenInclude(x => x.User)
            .Where(x => x.Farmer.UserId == farmerUserId);
        if (from.HasValue) query = query.Where(x => x.CollectedAt >= from.Value.ToUniversalTime());
        if (to.HasValue) { var end = to.Value.ToUniversalTime().AddDays(1); query = query.Where(x => x.CollectedAt < end); }
        var collections = await query.OrderByDescending(x => x.CollectedAt).ToListAsync(ct);
        return collections.Select(ToDto).ToList();
    }

    public async Task<CollectionDto?> GetFarmerCollectionAsync(Guid collectionId, Guid farmerUserId, CancellationToken ct)
    {
        var collection = await _db.Collections.AsNoTracking().Include(x => x.Farmer).ThenInclude(x => x.User)
            .SingleOrDefaultAsync(x => x.Id == collectionId && x.Farmer.UserId == farmerUserId, ct);
        return collection is null ? null : Map(collection, collection.Farmer);
    }

    public async Task<IReadOnlyList<CollectionDto>> AdminListAsync(DateTime? from, DateTime? to, Guid? farmerId, CancellationToken ct)
    {
        var query = _db.Collections.AsNoTracking().Include(x => x.Farmer).ThenInclude(x => x.User).AsQueryable();
        if (from.HasValue) query = query.Where(x => x.CollectedAt >= from.Value.ToUniversalTime());
        if (to.HasValue) { var end = to.Value.ToUniversalTime().AddDays(1); query = query.Where(x => x.CollectedAt < end); }
        if (farmerId.HasValue) query = query.Where(x => x.FarmerId == farmerId.Value);
        var collections = await query.OrderByDescending(x => x.CollectedAt).ToListAsync(ct);
        return collections.Select(ToDto).ToList();
    }

    private static CollectionDto ToDto(Collection x) => new()
    {
        Id = x.Id, FarmerId = x.FarmerId, FarmerName = x.Farmer.User.FullName,
        FarmerCode = x.Farmer.FarmerCode, RequestId = x.RequestId, CollectorId = x.CollectorId,
        GrossWeight = x.GrossWeight, WaterReduction = x.WaterReduction,
        BagWeight = x.BagWeight, OtherReduction = x.OtherReduction, FinalWeight = x.FinalWeight,
        PricePerKg = x.PricePerKg, TotalAmount = x.TotalAmount, Status = x.Status, CollectedAt = x.CollectedAt
    };

    private static CollectionDto Map(Collection collection, Farmer farmer) => ToDto(collection);
}
