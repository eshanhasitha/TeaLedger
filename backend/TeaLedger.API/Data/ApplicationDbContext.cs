using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Farmer> Farmers => Set<Farmer>();

    public DbSet<Collector> Collectors => Set<Collector>();

    public DbSet<Collection> Collections => Set<Collection>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(x => x.PhoneNumber)
            .IsUnique();

        modelBuilder.Entity<Farmer>()
            .HasIndex(x => x.FarmerCode)
            .IsUnique();

        modelBuilder.Entity<Collector>()
            .HasIndex(x => x.CollectorCode)
            .IsUnique();

         // User -> Farmer
    modelBuilder.Entity<User>()
        .HasOne(x => x.Farmer)
        .WithOne(x => x.User)
        .HasForeignKey<Farmer>(x => x.UserId)
        .OnDelete(DeleteBehavior.Restrict);

    // User -> Collector
    modelBuilder.Entity<User>()
        .HasOne(x => x.Collector)
        .WithOne(x => x.User)
        .HasForeignKey<Collector>(x => x.UserId)
        .OnDelete(DeleteBehavior.Restrict);

    // Collector -> Farmers
    modelBuilder.Entity<Collector>()
        .HasMany(x => x.Farmers)
        .WithOne(x => x.Collector)
        .HasForeignKey(x => x.CollectorId)
        .OnDelete(DeleteBehavior.Restrict);
    }
}