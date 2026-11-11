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

    public DbSet<TeaPrice> TeaPrices => Set<TeaPrice>();

    public DbSet<FinancialLedgerEntry> FinancialLedgerEntries
    => Set<FinancialLedgerEntry>();

    public DbSet<Loan> Loans => Set<Loan>();

    public DbSet<LoanRepayment> LoanRepayments => Set<LoanRepayment>();

    public DbSet<Deduction> Deductions => Set<Deduction>();
    public DbSet<Settlement> Settlements => Set<Settlement>();

    public DbSet<SettlementDeductionBreakdown> SettlementDeductionBreakdowns
        => Set<SettlementDeductionBreakdown>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new LoanConfiguration());

        modelBuilder.ApplyConfiguration(new LoanRepaymentConfiguration());

        modelBuilder.ApplyConfiguration(
            new LoanRepaymentLedgerConfiguration());

        modelBuilder.ApplyConfiguration(new DeductionConfiguration());

        modelBuilder.ApplyConfiguration(new SettlementConfiguration());

        modelBuilder.ApplyConfiguration(
            new SettlementDeductionBreakdownConfiguration());

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

        // Collection request
        modelBuilder.Entity<CollectionRequest>(entity =>
        {
            entity.ToTable("CollectionRequests");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.EstimatedQuantityKg)
                .HasPrecision(12, 3);

            entity.Property(x => x.CollectorNote)
                .HasMaxLength(500);

            entity.HasOne(x => x.Farmer)
                .WithMany()
                .HasForeignKey(x => x.FarmerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new
            {
                x.FarmerId,
                x.Status
            });

            entity.HasIndex(x => x.RequestedAt);
        });

        // Existing Collection entity
        modelBuilder.Entity<Collection>(entity =>
        {
            entity.Property(x => x.GrossWeight).HasPrecision(12, 3);
            entity.Property(x => x.WaterReduction).HasPrecision(12, 3);
            entity.Property(x => x.BagWeight).HasPrecision(12, 3);
            entity.Property(x => x.OtherReduction).HasPrecision(12, 3);
            entity.Property(x => x.FinalWeight).HasPrecision(12, 3);

            entity.Property(x => x.PricePerKg).HasPrecision(12, 2);
            entity.Property(x => x.TotalAmount).HasPrecision(14, 2);

            entity.HasOne(x => x.Request)
                .WithOne(x => x.Collection)
                .HasForeignKey<Collection>(x => x.RequestId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => x.RequestId)
                .IsUnique();

            entity.HasIndex(x => new
            {
                x.FarmerId,
                x.CollectedAt
            });

            entity.HasIndex(x => new
            {
                x.CollectorId,
                x.CollectedAt
            });
        });

        // Notifications
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Title)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Message)
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(x => x.EntityType)
                .HasMaxLength(80)
                .IsRequired();

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new
            {
                x.UserId,
                x.CreatedAt
            });
        });

        // Weight verification
        modelBuilder.Entity<WeightVerification>(entity =>
        {
            entity.ToTable("WeightVerifications");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.GrossWeight).HasPrecision(12, 3);
            entity.Property(x => x.WaterReduction).HasPrecision(12, 3);
            entity.Property(x => x.BagWeight).HasPrecision(12, 3);
            entity.Property(x => x.OtherReduction).HasPrecision(12, 3);
            entity.Property(x => x.FinalWeight).HasPrecision(12, 3);

            entity.HasOne(x => x.Collection)
                .WithOne(x => x.WeightVerification)
                .HasForeignKey<WeightVerification>(x => x.CollectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => x.CollectionId)
                .IsUnique();
        });

        // Farmer passbook
        modelBuilder.Entity<PassbookEntry>(entity =>
        {
            entity.ToTable("PassbookEntries");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.GrossWeight).HasPrecision(12, 3);
            entity.Property(x => x.TotalReduction).HasPrecision(12, 3);
            entity.Property(x => x.FinalWeight).HasPrecision(12, 3);

            entity.HasOne(x => x.Farmer)
                .WithMany()
                .HasForeignKey(x => x.FarmerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Collection)
                .WithOne(x => x.PassbookEntry)
                .HasForeignKey<PassbookEntry>(x => x.CollectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => x.CollectionId)
                .IsUnique();

            entity.HasIndex(x => new
            {
                x.FarmerId,
                x.RecordedAt
            });
        });

        modelBuilder.Entity<TeaPrice>(entity =>
        {
            entity.ToTable("TeaPrices");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.PricePerKg)
                .HasPrecision(12, 2)
                .IsRequired();

            entity.Property(x => x.EffectiveFrom)
                .IsRequired();

            entity.Property(x => x.CreatedAt)
                .IsRequired();

            entity.Property(x => x.UpdatedAt)
                .IsRequired();

            entity.HasOne(x => x.Collector)
                .WithMany()
                .HasForeignKey(x => x.CollectorId)
                .OnDelete(DeleteBehavior.Restrict);

            // One monthly price per collector.
            entity.HasIndex(x => new
            {
                x.CollectorId,
                x.Year,
                x.Month
            })
            .IsUnique();

            entity.HasIndex(x => new
            {
                x.CollectorId,
                x.EffectiveFrom
            });

            entity.ToTable(table =>
            {
                table.HasCheckConstraint(
                    "CK_TeaPrices_Month",
                    "\"Month\" >= 1 AND \"Month\" <= 12");

                table.HasCheckConstraint(
                    "CK_TeaPrices_Year",
                    "\"Year\" >= 2020 AND \"Year\" <= 2100");

                table.HasCheckConstraint(
                    "CK_TeaPrices_PricePerKg",
                    "\"PricePerKg\" > 0");
            });
        });

        modelBuilder.Entity<FinancialLedgerEntry>(entity =>
        {
            entity.ToTable("FinancialLedgerEntries");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.TransactionType)
                .HasConversion<string>()
                .HasMaxLength(40)
                .IsRequired();

            entity.Property(x => x.Direction)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.Amount)
                .HasPrecision(14, 2)
                .IsRequired();

            entity.Property(x => x.Description)
                .HasMaxLength(250)
                .IsRequired();

            entity.Property(x => x.Reference)
                .HasMaxLength(100);

            entity.Property(x => x.OccurredAt)
                .IsRequired();

            entity.Property(x => x.CreatedAt)
                .IsRequired();

            entity.Property(x => x.DeductionId);

            entity.HasOne(x => x.Farmer)
                .WithMany()
                .HasForeignKey(x => x.FarmerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Collection)
                .WithMany()
                .HasForeignKey(x => x.CollectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new
            {
                x.FarmerId,
                x.OccurredAt
            });

            entity.HasIndex(x => new
            {
                x.TransactionType,
                x.Direction,
                x.OccurredAt
            });

            entity.HasIndex(x => new
            {
                x.CollectionId,
                x.TransactionType
            })
            .IsUnique()
            .HasFilter("\"CollectionId\" IS NOT NULL");

            entity.ToTable(table =>
            {
                table.HasCheckConstraint(
                    "CK_FinancialLedgerEntries_Amount",
                    "\"Amount\" > 0");
            });

            entity.HasIndex(x => x.DeductionId)
            .IsUnique()
            .HasFilter("\"DeductionId\" IS NOT NULL");

            entity.HasIndex(x => x.SettlementId)
                .IsUnique()
                .HasFilter("\"SettlementId\" IS NOT NULL");
        }

        );

    }
}
