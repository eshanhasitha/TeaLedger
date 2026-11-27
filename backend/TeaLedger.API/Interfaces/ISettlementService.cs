
using TeaLedger.API.DTOs.Settlements;

namespace TeaLedger.API.Interfaces;

public interface ISettlementService
{
    Task<SettlementDto> CreateAsync(
        Guid adminUserId,
        CreateSettlementDto input,
        CancellationToken ct);

    Task<SettlementDto> MarkPaidAsync(
        Guid adminUserId,
        Guid settlementId,
        CancellationToken ct);

    Task<IReadOnlyList<SettlementDto>> GetAdminSettlementsAsync(
        int? year,
        int? month,
        string? status,
        CancellationToken ct);

    Task<IReadOnlyList<SettlementDto>> GetFarmerSettlementsAsync(
        Guid farmerUserId,
        CancellationToken ct);

    Task<IReadOnlyList<SettlementDto>> GetCollectorSettlementsAsync(
        Guid collectorUserId,
        CancellationToken ct);

    Task<SettlementDto> GetFarmerSettlementAsync(
        Guid farmerUserId,
        Guid settlementId,
        CancellationToken ct);
}
