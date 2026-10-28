
using TeaLedger.API.DTOs.Farmers;

namespace TeaLedger.API.Interfaces;

public interface IFarmerService
{
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
}
