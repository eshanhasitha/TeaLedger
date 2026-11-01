using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Models;
using TeaLedger.API.Data.Configuration;

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

    public DbSet<WeightVerification> WeightVerifications => Set<WeightVerification>();

    public DbSet<PassbookEntry> PassbookEntries => Set<PassbookEntry>();

    public DbSet<CollectionRequest> CollectionRequests => Set<CollectionRequest>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    
    

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

        modelBuilder.Entity<Farmer>()
            .HasOne(f => f.User)
            .WithOne(u => u.Farmer)
            .HasForeignKey<Farmer>(f => f.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Farmer>()
            .HasOne(f => f.Collector)
            .WithMany(c => c.Farmers)
            .HasForeignKey(f => f.CollectorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Collector>()
            .HasIndex(x => x.CollectorCode)
            .IsUnique();
        modelBuilder.Entity<Farmer>()
            .HasIndex(f => new { f.CollectorId, f.IsActive });

        modelBuilder.Entity<Collection>()
            .HasOne(x => x.Request)
            .WithOne(x => x.Collection)
            .HasForeignKey<Collection>(x => x.RequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Collection>()
            .HasOne(x => x.WeightVerification)
            .WithOne(x => x.Collection)
            .HasForeignKey<WeightVerification>(x => x.CollectionId);

        modelBuilder.Entity<Collection>()
            .HasOne(x => x.PassbookEntry)
            .WithOne(x => x.Collection)
            .HasForeignKey<PassbookEntry>(x => x.CollectionId);
        
        modelBuilder.ApplyConfiguration(
            new CollectorConfiguration());

        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.ToTable("ActivityLogs");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Action)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.EntityType)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Details)
                .HasMaxLength(1000);

            entity.HasIndex(x => x.ActorUserId);

            entity.HasIndex(x => x.OccurredAt);

            entity.HasIndex(x => new
            {
                x.EntityType,
                x.EntityId
            });
        });

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
