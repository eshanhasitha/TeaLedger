using TeaLedger.API.DTOs.Collections;

namespace TeaLedger.API.Interfaces;

public interface ICollectionService
{
    Task<CollectionDto> CreateAsync(Guid collectorUserId, CreateCollectionDto input, CancellationToken ct);
    Task<IReadOnlyList<CollectionDto>> FarmerHistoryAsync(Guid farmerUserId, DateTime? from, DateTime? to, CancellationToken ct);
    Task<CollectionDto?> GetFarmerCollectionAsync(Guid collectionId, Guid farmerUserId, CancellationToken ct);
    Task<IReadOnlyList<CollectionDto>> AdminListAsync(DateTime? from, DateTime? to, Guid? farmerId, CancellationToken ct);
}
