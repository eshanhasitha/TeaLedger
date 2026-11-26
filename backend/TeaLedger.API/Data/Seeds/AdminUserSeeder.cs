using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Seeds;

public static class AdminUserSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext db,
        IConfiguration configuration)
    {
        if (await db.Users.AnyAsync(user => user.Role == UserRole.Admin))
        {
            return;
        }

        var phoneNumber = configuration["AdminUser:PhoneNumber"];
        var password = configuration["AdminUser:Password"];

        if (string.IsNullOrWhiteSpace(phoneNumber) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Admin seed credentials are missing. Configure AdminUser__PhoneNumber and AdminUser__Password in the local .env file or environment variables.");
        }

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = configuration["AdminUser:FullName"] ?? "System Administrator",
            PhoneNumber = phoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}
