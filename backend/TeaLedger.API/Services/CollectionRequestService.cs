using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.CollectionRequests;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public class CollectionRequestService
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notifications;

    public CollectionRequestService(
        ApplicationDbContext db,
        INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<CollectionRequestDto> CreateAsync(
        Guid farmerUserId,
        CreateCollectionRequestDto input,
        CancellationToken ct)
    {
        if (input.EstimatedQuantityKg <= 0 ||
            input.EstimatedQuantityKg > 10000)
        {
            throw new ArgumentException(
                "Estimated quantity must be between 0 and 10,000 kg.");
        }

        var farmer = await _db.Farmers
            .Include(x => x.User)
            .Include(x => x.Collector)
                .ThenInclude(x => x!.User)
            .SingleOrDefaultAsync(
                x => x.UserId == farmerUserId, ct);

        if (farmer == null ||
            !farmer.IsActive ||
            !farmer.User.IsActive)
        {
            throw new InvalidOperationException(
                "Active farmer profile was not found.");
        }

        if (farmer.CollectorId == null ||
            farmer.Collector == null ||
            !farmer.Collector.User.IsActive)
        {
            throw new InvalidOperationException(
                "No active collector is assigned to this farmer.");
        }

        var hasActiveRequest = await _db.CollectionRequests
            .AnyAsync(x =>
                x.FarmerId == farmer.Id &&
                (x.Status == CollectionRequestStatus.Pending ||
                 x.Status == CollectionRequestStatus.Accepted), ct);

        if (hasActiveRequest)
        {
            throw new InvalidOperationException(
                "An active tea-ready request already exists.");
        }

        var request = new CollectionRequest
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            EstimatedQuantityKg = input.EstimatedQuantityKg,
            Status = CollectionRequestStatus.Pending,
            RequestedAt = DateTime.UtcNow
        };

        _db.CollectionRequests.Add(request);

        await _db.SaveChangesAsync(ct);

        await _notifications.NotifyAsync(
            farmer.Collector.UserId,
            "New tea-ready request",
            $"{farmer.User.FullName} reported " +
            $"{input.EstimatedQuantityKg} kg of tea leaves ready.",
            "CollectionRequest",
            request.Id,
            ct);

        return Map(request, farmer);
    }

    public async Task<IReadOnlyList<CollectionRequestDto>>
        GetFarmerRequestsAsync(
            Guid farmerUserId,
            CancellationToken ct)
    {
        return await _db.CollectionRequests
            .AsNoTracking()
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .Where(x => x.Farmer.UserId == farmerUserId)
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new CollectionRequestDto
            {
                Id = x.Id,
                FarmerId = x.FarmerId,
                FarmerName = x.Farmer.User.FullName,
                FarmerCode = x.Farmer.FarmerCode,
                EstimatedQuantityKg = x.EstimatedQuantityKg,
                Status = x.Status,
                RequestedAt = x.RequestedAt,
                RespondedAt = x.RespondedAt,
                CollectorNote = x.CollectorNote
            })
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<CollectionRequestDto>>
        GetCollectorRequestsAsync(
            Guid collectorUserId,
            CollectionRequestStatus? status,
            CancellationToken ct)
    {
        var collector = await _db.Collectors
            .SingleOrDefaultAsync(
                x => x.UserId == collectorUserId, ct);

        if (collector == null)
            throw new UnauthorizedAccessException(
                "Collector profile not found.");

        var query = _db.CollectionRequests
            .AsNoTracking()
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .Where(x => x.Farmer.CollectorId == collector.Id);

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        return await query
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new CollectionRequestDto
            {
                Id = x.Id,
                FarmerId = x.FarmerId,
                FarmerName = x.Farmer.User.FullName,
                FarmerCode = x.Farmer.FarmerCode,
                EstimatedQuantityKg = x.EstimatedQuantityKg,
                Status = x.Status,
                RequestedAt = x.RequestedAt,
                RespondedAt = x.RespondedAt,
                CollectorNote = x.CollectorNote
            })
            .ToListAsync(ct);
    }

    public async Task<CollectionRequestDto?> DecideAsync(
        Guid collectorUserId,
        Guid requestId,
        DecideCollectionRequestDto input,
        CancellationToken ct)
    {
        var collector = await _db.Collectors
            .SingleOrDefaultAsync(
                x => x.UserId == collectorUserId, ct);

        if (collector == null)
            throw new UnauthorizedAccessException(
                "Collector profile not found.");

        var request = await _db.CollectionRequests
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .SingleOrDefaultAsync(
                x => x.Id == requestId &&
                     x.Farmer.CollectorId == collector.Id, ct);

        if (request == null)
            return null;

        if (request.Status != CollectionRequestStatus.Pending)
            throw new InvalidOperationException(
                "Only pending requests can be decided.");

        request.Status = input.Decision.Trim().ToLowerInvariant() switch
        {
            "accept" => CollectionRequestStatus.Accepted,
            "reject" => CollectionRequestStatus.Rejected,
            "not-collected" => CollectionRequestStatus.NotCollected,
            _ => throw new ArgumentException(
                "Decision must be accept, reject, or not-collected.")
        };

        request.CollectorNote = input.Note?.Trim();
        request.RespondedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        await _notifications.NotifyAsync(
            request.Farmer.UserId,
            "Tea collection request updated",
            $"Your request was {request.Status.ToString().ToLowerInvariant()}.",
            "CollectionRequest",
            request.Id,
            ct);

        return Map(request, request.Farmer);
    }

    public async Task<IReadOnlyList<CollectionRequestDto>>
        GetAllForAdminAsync(
            CollectionRequestStatus? status,
            CancellationToken ct)
    {
        var query = _db.CollectionRequests
            .AsNoTracking()
            .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        return await query
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new CollectionRequestDto
            {
                Id = x.Id,
                FarmerId = x.FarmerId,
                FarmerName = x.Farmer.User.FullName,
                FarmerCode = x.Farmer.FarmerCode,
                EstimatedQuantityKg = x.EstimatedQuantityKg,
                Status = x.Status,
                RequestedAt = x.RequestedAt,
                RespondedAt = x.RespondedAt,
                CollectorNote = x.CollectorNote
            })
            .ToListAsync(ct);
    }

    private static CollectionRequestDto Map(
        CollectionRequest request,
        Farmer farmer)
    {
        return new CollectionRequestDto
        {
            Id = request.Id,
            FarmerId = request.FarmerId,
            FarmerName = farmer.User.FullName,
            FarmerCode = farmer.FarmerCode,
            EstimatedQuantityKg = request.EstimatedQuantityKg,
            Status = request.Status,
            RequestedAt = request.RequestedAt,
            RespondedAt = request.RespondedAt,
            CollectorNote = request.CollectorNote
        };
    }
}
