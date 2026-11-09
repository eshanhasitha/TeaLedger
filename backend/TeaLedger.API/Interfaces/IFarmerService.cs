using TeaLedger.API.DTOs.Farmers;

namespace TeaLedger.API.Interfaces;

public interface IFarmerService
{
    // Admin operations
    Task<FarmerListResponse> GetFarmersAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        CancellationToken cancellationToken = default);

    Task<FarmerResponse?> GetFarmerByIdAsync(
        Guid farmerId,
        CancellationToken cancellationToken = default);

    Task<FarmerResponse> CreateFarmerAsync(
        CreateFarmerRequest request,
        CancellationToken cancellationToken = default);

    Task<FarmerResponse?> UpdateFarmerAsync(
        Guid farmerId,
        UpdateFarmerRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> SetFarmerStatusAsync(
        Guid farmerId,
        bool isActive,
        CancellationToken cancellationToken = default);

    // Collector operations
    Task<FarmerListResponse> GetCollectorFarmersAsync(
        Guid collectorUserId,
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        CancellationToken cancellationToken = default);

    Task<FarmerResponse?> GetCollectorFarmerByIdAsync(
        Guid collectorUserId,
        Guid farmerId,
        CancellationToken cancellationToken = default);

    Task<FarmerResponse> CreateCollectorFarmerAsync(
        Guid collectorUserId,
        CreateFarmerRequest request,
        CancellationToken cancellationToken = default);

    Task<FarmerResponse?> UpdateCollectorFarmerAsync(
        Guid collectorUserId,
        Guid farmerId,
        UpdateFarmerRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> SetCollectorFarmerStatusAsync(
        Guid collectorUserId,
        Guid farmerId,
        bool isActive,
        CancellationToken cancellationToken = default);
}
