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

        modelBuilder.Entity<Farmer>()
            .HasOne(x => x.User)
            .WithOne()
            .HasForeignKey<Farmer>(x => x.UserId);

        modelBuilder.Entity<Collector>()
            .HasOne(x => x.User)
            .WithOne()
            .HasForeignKey<Collector>(x => x.UserId);
    }
}