namespace TeaLedger.API.Data.Seeds;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext db,
        IConfiguration configuration)
    {
        await AdminUserSeeder.SeedAsync(db, configuration);
    }
}
