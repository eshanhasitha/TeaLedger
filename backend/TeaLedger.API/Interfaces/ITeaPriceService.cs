using TeaLedger.API.DTOs.TeaPrices;

namespace TeaLedger.API.Interfaces;

public interface ITeaPriceService
{
    Task<TeaPriceDto> SetMonthlyPriceForCollectorUserAsync(
        Guid collectorUserId,
        SetMonthlyTeaPriceDto input,
        CancellationToken ct);

    Task<TeaPriceDto> SetMonthlyPriceForAdminAsync(
        Guid adminUserId,
        Guid collectorId,
        SetMonthlyTeaPriceDto input,
        CancellationToken ct);

    Task<TeaPriceDto?> GetEffectivePriceForUserAsync(
        Guid userId,
        DateTime date,
        CancellationToken ct);

    Task<IReadOnlyList<TeaPriceDto>> GetPriceHistoryForUserAsync(
        Guid userId,
        CancellationToken ct);

    Task<IReadOnlyList<TeaPriceDto>> GetAdminPriceHistoryAsync(
        Guid collectorId,
        CancellationToken ct);
}