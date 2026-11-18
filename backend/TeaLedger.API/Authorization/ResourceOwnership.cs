
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;

namespace TeaLedger.API.Authorization;

public static class ResourceOwnership
{
    public static async Task<bool> FarmerOwnsResourceAsync(
        ApplicationDbContext db,
        Guid farmerUserId,
        Guid farmerId,
        CancellationToken ct = default)
    {
        if (farmerUserId == Guid.Empty ||
            farmerId == Guid.Empty)
        {
            return false;
        }

        return await db.Farmers.AnyAsync(
            x => x.Id == farmerId &&
                 x.UserId == farmerUserId,
            ct);
    }

    public static async Task<bool> CollectorOwnsFarmerAsync(
        ApplicationDbContext db,
        Guid collectorUserId,
        Guid farmerId,
        CancellationToken ct = default)
    {
        if (collectorUserId == Guid.Empty ||
            farmerId == Guid.Empty)
        {
            return false;
        }

        return await db.Farmers.AnyAsync(
            x => x.Id == farmerId &&
                 x.Collector != null &&
                 x.Collector.UserId == collectorUserId,
            ct);
    }
}
