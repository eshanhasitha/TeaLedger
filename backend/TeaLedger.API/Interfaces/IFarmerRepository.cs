
using TeaLedger.API.Models;

namespace TeaLedger.API.Interfaces;

public interface IFarmerRepository
{
    Task<(IReadOnlyList<Farmer> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        Guid? collectorId,
        CancellationToken cancellationToken);

    Task<Farmer?> GetByIdAsync(
        Guid farmerId,
        Guid? collectorId,
        bool tracking,
        CancellationToken cancellationToken);

    Task<User?> GetUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<Collector?> GetCollectorByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<bool> CollectorExistsAsync(
        Guid collectorId,
        CancellationToken cancellationToken);

    Task<bool> UserHasFarmerProfileAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<bool> FarmerCodeExistsAsync(
        string farmerCode,
        Guid? excludeFarmerId,
        CancellationToken cancellationToken);

    Task AddAsync(
        Farmer farmer,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
