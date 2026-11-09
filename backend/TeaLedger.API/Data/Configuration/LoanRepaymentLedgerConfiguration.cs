using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class LoanRepaymentLedgerConfiguration
    : IEntityTypeConfiguration<FinancialLedgerEntry>
{
    public void Configure(
        EntityTypeBuilder<FinancialLedgerEntry> entity)
    {
        entity.HasOne(x => x.LoanRepayment)
            .WithOne(x => x.LedgerEntry)
            .HasForeignKey<FinancialLedgerEntry>(
                x => x.LoanRepaymentId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(x => x.LoanRepaymentId)
            .IsUnique()
            .HasFilter("\"LoanRepaymentId\" IS NOT NULL");
    }
}