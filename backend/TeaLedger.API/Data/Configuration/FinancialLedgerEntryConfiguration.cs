using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class FinancialLedgerEntryConfiguration
    : IEntityTypeConfiguration<FinancialLedgerEntry>
{
    public void Configure(EntityTypeBuilder<FinancialLedgerEntry> entity)
    {
        entity.ToTable("FinancialLedgerEntries", table =>
        {
            table.HasCheckConstraint(
                "CK_FinancialLedgerEntries_Amount",
                "\"Amount\" > 0");

            table.HasCheckConstraint(
                "CK_FinancialLedgerEntries_ValidTransaction",
                "((\"TransactionType\" = 'CollectionEarning' AND \"Direction\" = 'Credit') OR " +
                "(\"TransactionType\" = 'Deduction' AND \"Direction\" = 'Debit') OR " +
                "(\"TransactionType\" = 'LoanDisbursement' AND \"Direction\" = 'Credit') OR " +
                "(\"TransactionType\" = 'LoanRepayment' AND \"Direction\" = 'Debit') OR " +
                "(\"TransactionType\" = 'SettlementPayment' AND \"Direction\" = 'Debit') OR " +
                "(\"TransactionType\" = 'Adjustment' AND \"Direction\" IN ('Credit', 'Debit')))");
        });

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

        entity.Property(x => x.OccurredAt).IsRequired();
        entity.Property(x => x.CreatedAt).IsRequired();

        entity.HasOne(x => x.Farmer)
            .WithMany()
            .HasForeignKey(x => x.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.Collection)
            .WithMany()
            .HasForeignKey(x => x.CollectionId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(x => new { x.FarmerId, x.OccurredAt });
        entity.HasIndex(x => new
        {
            x.TransactionType,
            x.Direction,
            x.OccurredAt
        });
        entity.HasIndex(x => new { x.CollectionId, x.TransactionType })
            .IsUnique()
            .HasFilter("\"CollectionId\" IS NOT NULL");
        entity.HasIndex(x => x.DeductionId)
            .IsUnique()
            .HasFilter("\"DeductionId\" IS NOT NULL");
        entity.HasIndex(x => x.SettlementId)
            .IsUnique()
            .HasFilter("\"SettlementId\" IS NOT NULL");
    }
}
