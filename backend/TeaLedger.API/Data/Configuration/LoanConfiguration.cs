using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> entity)
    {
        entity.ToTable("Loans", table =>
        {
            table.HasCheckConstraint(
                "CK_Loans_PrincipalAmount",
                "\"PrincipalAmount\" > 0");
        });

        entity.HasKey(x => x.Id);

        entity.Property(x => x.PrincipalAmount)
            .HasPrecision(14, 2)
            .IsRequired();

        entity.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        entity.Property(x => x.Notes)
            .HasMaxLength(500);

        entity.Property(x => x.IssuedAt)
            .IsRequired();

        entity.Property(x => x.CreatedByUserId)
            .IsRequired();

        entity.HasOne(x => x.Farmer)
            .WithMany()
            .HasForeignKey(x => x.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.Collector)
            .WithMany()
            .HasForeignKey(x => x.CollectorId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasMany(x => x.Repayments)
            .WithOne(x => x.Loan)
            .HasForeignKey(x => x.LoanId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(x => new
        {
            x.FarmerId,
            x.Status,
            x.IssuedAt
        });

        entity.HasIndex(x => new
        {
            x.CollectorId,
            x.Status,
            x.IssuedAt
        });
    }
}