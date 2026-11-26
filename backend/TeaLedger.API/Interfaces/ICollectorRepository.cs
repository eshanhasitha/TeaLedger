
using TeaLedger.API.Models;

namespace TeaLedger.API.Interfaces;

public interface ICollectorRepository
{
    Task<(IReadOnlyList<Collector> Items, int TotalCount)>
        GetPagedAsync(
            int page,
            int pageSize,
            string? search,
            string? area,
            bool? isActive,
            CancellationToken cancellationToken);

    Task<Collector?> GetByIdAsync(
        Guid id,
        bool tracking,
        CancellationToken cancellationToken);

    Task<Collector?> GetByUserIdAsync(
        Guid userId,
        bool tracking,
        CancellationToken cancellationToken);

    Task<bool> PhoneNumberExistsAsync(
        string phoneNumber,
        Guid? excludedUserId,
        CancellationToken cancellationToken);

    Task<bool> CollectorCodeExistsAsync(
        string collectorCode,
        CancellationToken cancellationToken);

    Task<int> GetAssignedFarmerCountAsync(
        Guid collectorId,
        CancellationToken cancellationToken);

    Task AddAsync(
        Collector collector,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
