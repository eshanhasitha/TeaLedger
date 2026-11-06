using TeaLedger.API.DTOs.Deductions;
using TeaLedger.API.Models;

namespace TeaLedger.API.Interfaces;

public interface IDeductionService
{
    Task<DeductionDto> CreateAsync(
        Guid collectorUserId,
        Guid farmerId,
        CreateDeductionDto input,
        CancellationToken ct);

    Task<IReadOnlyList<DeductionDto>> GetCollectorAsync(
        Guid collectorUserId,
        Guid? farmerId,
        DeductionCategory? category,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct);

    Task<IReadOnlyList<DeductionDto>> GetFarmerAsync(
        Guid farmerUserId,
        DeductionCategory? category,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct);

    Task<IReadOnlyList<DeductionDto>> GetAdminAsync(
        Guid? farmerId,
        Guid? collectorId,
        DeductionCategory? category,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct);

    Task<DeductionSummaryDto> GetAdminSummaryAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct);
}