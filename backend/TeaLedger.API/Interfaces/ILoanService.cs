using TeaLedger.API.DTOs.Loans;

namespace TeaLedger.API.Interfaces;

public interface ILoanService
{
    Task<LoanDto> CreateLoanAsync(
        Guid collectorUserId,
        Guid farmerId,
        CreateLoanDto input,
        CancellationToken ct);

    Task<LoanRepaymentDto> RecordRepaymentAsync(
        Guid collectorUserId,
        Guid loanId,
        CreateLoanRepaymentDto input,
        CancellationToken ct);

    Task<IReadOnlyList<LoanDto>> GetCollectorLoansAsync(
        Guid collectorUserId,
        Guid? farmerId,
        CancellationToken ct);

    Task<IReadOnlyList<LoanDto>> GetFarmerLoansAsync(
        Guid farmerUserId,
        CancellationToken ct);

    Task<LoanDto?> GetFarmerLoanAsync(
        Guid farmerUserId,
        Guid loanId,
        CancellationToken ct);

    Task<IReadOnlyList<LoanDto>> GetAdminLoansAsync(
        Guid? farmerId,
        Guid? collectorId,
        CancellationToken ct);

    Task<LoanDto?> GetCollectorLoanAsync(
        Guid collectorUserId,
        Guid loanId,
        CancellationToken ct);
}