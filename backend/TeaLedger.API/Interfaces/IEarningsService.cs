using TeaLedger.API.DTOs.Earnings;

namespace TeaLedger.API.Interfaces;

public interface IEarningsService
{
    Task<EarningsSummaryDto> GetDailyEarningsAsync(
        Guid farmerUserId,
        DateOnly date,
        CancellationToken ct);

    Task<EarningsSummaryDto> GetMonthlyEarningsAsync(
        Guid farmerUserId,
        int year,
        int month,
        CancellationToken ct);

    Task<IReadOnlyList<CollectionEarningDto>> GetCollectionEarningsAsync(
        Guid farmerUserId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct);

    Task<EarningsSummaryDto> GetCollectorEarningsAsync(
        Guid collectorUserId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct);

    Task<AdminEarningsSummaryDto> GetAdminEarningsAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct);

    Task<IReadOnlyList<FinancialLedgerEntryDto>> GetFarmerLedgerAsync(
        Guid farmerUserId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct);

    Task<EarningsReconciliationDto> ReconcileAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct);

    Task<FarmerFinancialSummaryDto> GetFarmerFinancialSummaryAsync(
        Guid farmerUserId,
        DateOnly from,
        DateOnly to,
        CancellationToken ct);
}