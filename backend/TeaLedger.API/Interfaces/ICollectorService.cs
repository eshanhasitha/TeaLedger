using TeaLedger.API.DTOs.Collectors;

namespace TeaLedger.API.Interfaces;

public interface ICollectorService
{
    Task<(IReadOnlyList<CollectorDto> Items, int TotalCount)>
        GetCollectorsAsync(
            int page,
            int pageSize,
            string? search,
            bool? isActive,
            CancellationToken cancellationToken);

    Task<CollectorDto?> GetCollectorByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<CollectorDto> CreateCollectorAsync(
        CreateCollectorDto request,
        CancellationToken cancellationToken);

    Task<CollectorDto?> UpdateCollectorAsync(
        Guid id,
        UpdateCollectorDto request,
        CancellationToken cancellationToken);

    Task<bool> SetCollectorStatusAsync(
        Guid id,
        bool isActive,
        CancellationToken cancellationToken);
}