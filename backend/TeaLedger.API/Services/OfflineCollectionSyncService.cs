
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Sync;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public class OfflineCollectionSyncService
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notifications;
    private readonly ILogger<OfflineCollectionSyncService> _logger;

    public OfflineCollectionSyncService(
        ApplicationDbContext db,
        INotificationService notifications,
        ILogger<OfflineCollectionSyncService> logger)
    {
        _db = db;
        _notifications = notifications;
        _logger = logger;
    }

    public async Task<SyncCollectionsResponse> SyncAsync(
        Guid collectorUserId,
        SyncCollectionsRequest input,
        CancellationToken ct)
    {
        var collector = await _db.Collectors
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.UserId == collectorUserId,
                ct);

        if (collector is null)
        {
            throw new UnauthorizedAccessException(
                "Collector profile not found.");
        }

        var response = new SyncCollectionsResponse
        {
            Total = input.Collections.Count
        };

        // Prevent duplicate operation IDs inside the same batch.
        var duplicateIds = input.Collections
            .GroupBy(x => x.ClientOperationId)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToHashSet();

        foreach (var item in input.Collections)
        {
            ct.ThrowIfCancellationRequested();

            if (item.ClientOperationId == Guid.Empty ||
                item.RequestId == Guid.Empty)
            {
                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Rejected,
                    null,
                    "Operation ID and request ID are required.");

                continue;
            }

            if (duplicateIds.Contains(item.ClientOperationId))
            {
                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Rejected,
                    null,
                    "Duplicate operation ID in this batch.");

                continue;
            }

            if (item.CollectedAt == default ||
                item.CollectedAt > DateTime.UtcNow.AddMinutes(10))
            {
                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Rejected,
                    null,
                    "Invalid collection date.");

                continue;
            }

            var existingOperation = await _db.OfflineCollectionSyncs
                .AsNoTracking()
                .SingleOrDefaultAsync(
                    x => x.CollectorUserId == collectorUserId &&
                         x.ClientOperationId == item.ClientOperationId,
                    ct);

            if (existingOperation is not null)
            {
                if (existingOperation.RequestId != item.RequestId)
                {
                    AddResult(
                        response,
                        item,
                        OfflineSyncStatus.Conflict,
                        existingOperation.CollectionId,
                        "This operation ID was already used for another request.");

                    continue;
                }

                AddResult(
                    response,
                    item,
                    existingOperation.Status,
                    existingOperation.CollectionId,
                    existingOperation.ErrorMessage,
                    previouslySynced:
                        existingOperation.Status == OfflineSyncStatus.Synced);

                continue;
            }

            var request = await _db.CollectionRequests
                .Include(x => x.Farmer)
                .ThenInclude(x => x.User)
                .SingleOrDefaultAsync(
                    x => x.Id == item.RequestId &&
                         x.Farmer.CollectorId == collector.Id,
                    ct);

            if (request is null)
            {
                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Rejected,
                    null,
                    "Request not found or not assigned to this collector.");

                continue;
            }

            if (!request.Farmer.IsActive ||
                !request.Farmer.User.IsActive)
            {
                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Rejected,
                    null,
                    "Farmer account is inactive.");

                continue;
            }

            if (request.Status != CollectionRequestStatus.Accepted)
            {
                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Conflict,
                    null,
                    $"Request is currently {request.Status}; only Accepted requests can be synced.");

                continue;
            }

            var collectionAlreadyExists = await _db.Collections
                .AnyAsync(
                    x => x.RequestId == request.Id,
                    ct);

            if (collectionAlreadyExists)
            {
                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Conflict,
                    null,
                    "A collection already exists for this request.");

                continue;
            }

            var collectedAt = item.CollectedAt.Kind switch
            {
                DateTimeKind.Utc => item.CollectedAt,
                DateTimeKind.Local => item.CollectedAt.ToUniversalTime(),
                _ => DateTime.SpecifyKind(
                    item.CollectedAt,
                    DateTimeKind.Utc)
            };

            var now = DateTime.UtcNow;

            var collection = new Collection
            {
                Id = Guid.NewGuid(),
                RequestId = request.Id,
                FarmerId = request.FarmerId,
                CollectorId = collector.Id,

                // Weight verification is handled by the existing workflow.
                GrossWeight = 0,
                WaterReduction = 0,
                BagWeight = 0,
                OtherReduction = 0,
                FinalWeight = 0,

                PricePerKg = 0,
                TotalAmount = 0,

                Status = CollectionStatus.Pending,
                CollectedAt = collectedAt,
                CreatedAt = now,
                UpdatedAt = now
            };

            var syncRecord = new OfflineCollectionSync
            {
                Id = Guid.NewGuid(),
                ClientOperationId = item.ClientOperationId,
                CollectorUserId = collectorUserId,
                RequestId = request.Id,
                CollectionId = collection.Id,
                Status = OfflineSyncStatus.Synced,
                ClientCollectedAt = collectedAt,
                ReceivedAt = now,
                SyncedAt = now
            };

            request.Status = CollectionRequestStatus.Collected;
            request.RespondedAt = now;

            _db.Collections.Add(collection);
            _db.OfflineCollectionSyncs.Add(syncRecord);

            try
            {
                // EF Core wraps this SaveChanges in a database transaction
                // for relational providers. Both records are committed together.
                await _db.SaveChangesAsync(ct);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogWarning(
                    ex,
                    "Offline collection sync failed for operation {OperationId}",
                    item.ClientOperationId);

                // Clear pending tracked changes before processing the next item.
                _db.ChangeTracker.Clear();

                var concurrentlyProcessed = await _db.OfflineCollectionSyncs
                    .AsNoTracking()
                    .SingleOrDefaultAsync(
                        x => x.CollectorUserId == collectorUserId &&
                             x.ClientOperationId == item.ClientOperationId,
                        ct);

                if (concurrentlyProcessed is not null &&
                    concurrentlyProcessed.RequestId == item.RequestId)
                {
                    AddResult(
                        response,
                        item,
                        concurrentlyProcessed.Status,
                        concurrentlyProcessed.CollectionId,
                        concurrentlyProcessed.ErrorMessage,
                        previouslySynced:
                            concurrentlyProcessed.Status == OfflineSyncStatus.Synced);

                    continue;
                }

                AddResult(
                    response,
                    item,
                    OfflineSyncStatus.Conflict,
                    null,
                    "The operation could not be saved because the request may have been processed concurrently.");

                continue;
            }

            // Push notification is best-effort after the database commit.
            // A notification failure must not undo a successful collection sync.
            try
            {
                await _notifications.NotifyAsync(
                    request.Farmer.UserId,
                    "Tea collection confirmed",
                    $"Your tea collection has been recorded. Collection ID: {collection.Id}",
                    "Collection",
                    collection.Id,
                    ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Collection {CollectionId} synced, but farmer notification failed.",
                    collection.Id);
            }

            AddResult(
                response,
                item,
                OfflineSyncStatus.Synced,
                collection.Id,
                "Collection synchronized successfully.");
        }

        return response;
    }

    private static void AddResult(
        SyncCollectionsResponse response,
        OfflineCollectionSyncDto item,
        OfflineSyncStatus status,
        Guid? collectionId,
        string? message,
        bool previouslySynced = false)
    {
        response.Results.Add(new OfflineCollectionSyncResultDto
        {
            ClientOperationId = item.ClientOperationId,
            RequestId = item.RequestId,
            CollectionId = collectionId,
            Status = status.ToString(),
            Message = message,
            WasPreviouslySynced = previouslySynced
        });

        switch (status)
        {
            case OfflineSyncStatus.Synced:
                response.Synced++;
                break;

            case OfflineSyncStatus.Conflict:
                response.Conflicts++;
                break;

            case OfflineSyncStatus.Rejected:
                response.Rejected++;
                break;
        }
    }
}
