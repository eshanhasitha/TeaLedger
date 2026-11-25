using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class LoanRepaymentConfiguration
    : IEntityTypeConfiguration<LoanRepayment>
{
    public void Configure(EntityTypeBuilder<LoanRepayment> entity)
    {
        entity.ToTable("LoanRepayments", table =>
        {
            table.HasCheckConstraint(
                "CK_LoanRepayments_Amount",
                "\"Amount\" > 0");
        });

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Amount)
            .HasPrecision(14, 2)
            .IsRequired();

        entity.Property(x => x.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(LoanRepaymentMethod.Cash)
            .HasSentinel(LoanRepaymentMethod.Cash)
            .IsRequired();

        entity.Property(x => x.Reference)
            .HasMaxLength(100);

        entity.Property(x => x.Notes)
            .HasMaxLength(500);

        entity.Property(x => x.PaidAt)
            .IsRequired();

        entity.Property(x => x.RecordedByUserId)
            .IsRequired();

        entity.HasOne(x => x.Loan)
            .WithMany(x => x.Repayments)
            .HasForeignKey(x => x.LoanId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(x => new
        {
            x.LoanId,
            x.PaidAt
        });

        entity.HasIndex(x => x.RecordedByUserId);
    }
}
