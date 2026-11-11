
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class SettlementConfiguration
    : IEntityTypeConfiguration<Settlement>
{
    public void Configure(EntityTypeBuilder<Settlement> entity)
    {
        entity.ToTable("Settlements", table =>
        {
            table.HasCheckConstraint(
                "CK_Settlements_Year",
                "\"Year\" >= 2020 AND \"Year\" <= 2100");

            table.HasCheckConstraint(
                "CK_Settlements_Month",
                "\"Month\" >= 1 AND \"Month\" <= 12");

            table.HasCheckConstraint(
                "CK_Settlements_Amounts",
                "\"GrossTeaIncome\" >= 0 AND " +
                "\"MaterialDeductions\" >= 0 AND " +
                "\"LoanRepayments\" >= 0 AND " +
                "\"RemainingLoanBalance\" >= 0 AND " +
                "\"NetSettlementAmount\" >= 0");

            table.HasCheckConstraint(
                "CK_Settlements_QuantitiesAndPrice",
                "\"TotalTeaQuantityKg\" >= 0 AND " +
                "\"AverageTeaPricePerKg\" >= 0 AND " +
                "\"TotalDeductionQuantityKg\" >= 0");
        });

        entity.HasKey(x => x.Id);

        entity.Property(x => x.GrossTeaIncome)
            .HasPrecision(14, 2);

        entity.Property(x => x.TotalTeaQuantityKg)
            .HasPrecision(14, 3);

        entity.Property(x => x.AverageTeaPricePerKg)
            .HasPrecision(14, 2);

        entity.Property(x => x.MaterialDeductions)
            .HasPrecision(14, 2);

        entity.Property(x => x.LoanRepayments)
            .HasPrecision(14, 2);

        entity.Property(x => x.RemainingLoanBalance)
            .HasPrecision(14, 2);

        entity.Property(x => x.NetSettlementAmount)
            .HasPrecision(14, 2);

        entity.Property(x => x.TotalDeductionQuantityKg)
            .HasPrecision(14, 3);

        entity.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        entity.HasOne(x => x.Farmer)
            .WithMany()
            .HasForeignKey(x => x.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasMany(x => x.DeductionBreakdown)
            .WithOne(x => x.Settlement)
            .HasForeignKey(x => x.SettlementId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(x => x.PaymentLedgerEntry)
            .WithOne(x => x.Settlement)
            .HasForeignKey<FinancialLedgerEntry>(x => x.SettlementId)
            .OnDelete(DeleteBehavior.Restrict);

        // One settlement per farmer per calendar month.
        entity.HasIndex(x => new
        {
            x.FarmerId,
            x.Year,
            x.Month
        }).IsUnique();

        entity.HasIndex(x => new
        {
            x.Year,
            x.Month,
            x.Status
        });
    }
}
