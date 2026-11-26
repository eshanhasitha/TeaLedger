namespace TeaLedger.API.DTOs.Reports;

public sealed record PagedReport<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);

public sealed record CollectionReportRow(
    Guid CollectionId,
    Guid FarmerId,
    string FarmerName,
    Guid? CollectorId,
    string? CollectorName,
    decimal GrossWeight,
    decimal FinalWeight,
    decimal PricePerKg,
    decimal TotalAmount,
    string Status,
    DateTime CollectedAt);

public sealed record EarningsReportRow(
    Guid LedgerEntryId,
    Guid FarmerId,
    string FarmerName,
    decimal Amount,
    string Description,
    string? Reference,
    DateTime OccurredAt);

public sealed record DeductionReportRow(
    Guid DeductionId,
    Guid FarmerId,
    string FarmerName,
    string Category,
    string Description,
    decimal Quantity,
    string Unit,
    decimal UnitPrice,
    decimal Amount,
    DateTime OccurredAt);

public sealed record FarmerLoanReportRow(
    Guid LoanId,
    decimal PrincipalAmount,
    decimal RepaidAmount,
    decimal OutstandingAmount,
    string Status,
    DateTime IssuedAt);