using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class DeductionConfiguration
    : IEntityTypeConfiguration<Deduction>
{
    public void Configure(EntityTypeBuilder<Deduction> entity)
    {
        entity.ToTable("Deductions", table =>
        {
            table.HasCheckConstraint(
                "CK_Deductions_Quantity",
                "\"Quantity\" > 0");

            table.HasCheckConstraint(
                "CK_Deductions_UnitPrice",
                "\"UnitPrice\" > 0");

            table.HasCheckConstraint(
                "CK_Deductions_Amount",
                "\"Amount\" > 0");
        });

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Category)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        entity.Property(x => x.Description)
            .HasMaxLength(200)
            .IsRequired();

        entity.Property(x => x.Quantity)
            .HasPrecision(12, 3)
            .IsRequired();

        entity.Property(x => x.Unit)
            .HasMaxLength(20)
            .IsRequired();

        entity.Property(x => x.UnitPrice)
            .HasPrecision(14, 2)
            .IsRequired();

        entity.Property(x => x.Amount)
            .HasPrecision(14, 2)
            .IsRequired();

        entity.Property(x => x.Notes)
            .HasMaxLength(500);

        entity.HasOne(x => x.Farmer)
            .WithMany()
            .HasForeignKey(x => x.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.Collector)
            .WithMany()
            .HasForeignKey(x => x.CollectorId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.LedgerEntry)
            .WithOne(x => x.Deduction)
            .HasForeignKey<FinancialLedgerEntry>(
                x => x.DeductionId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(x => new
        {
            x.FarmerId,
            x.OccurredAt
        });

        entity.HasIndex(x => new
        {
            x.CollectorId,
            x.OccurredAt
        });

        entity.HasIndex(x => new
        {
            x.Category,
            x.OccurredAt
        });
    }
}