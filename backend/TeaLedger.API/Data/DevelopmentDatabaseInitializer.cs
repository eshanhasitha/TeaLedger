
using Microsoft.EntityFrameworkCore;

namespace TeaLedger.API.Data;

public static class DevelopmentDatabaseInitializer
{
    public static async Task InitializeAsync(
        ApplicationDbContext db,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        // Apply migrations only in the Development environment.
        await db.Database.MigrateAsync(cancellationToken);

        // This initializer intentionally does not invent users or
        // passwords. Add seed records here using your actual entities.
        logger.LogInformation(
            "TeaLedger development database migrations completed.");
    }
}
