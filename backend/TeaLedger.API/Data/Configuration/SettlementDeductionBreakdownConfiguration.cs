using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class SettlementDeductionBreakdownConfiguration
    : IEntityTypeConfiguration<SettlementDeductionBreakdown>
{
    public void Configure(
        EntityTypeBuilder<SettlementDeductionBreakdown> entity)
    {
        entity.ToTable("SettlementDeductionBreakdowns");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Category)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        entity.Property(x => x.Unit)
            .HasMaxLength(20)
            .IsRequired();

        entity.Property(x => x.Quantity)
            .HasPrecision(14, 3)
            .IsRequired();

        entity.Property(x => x.UnitPrice)
            .HasPrecision(14, 2)
            .IsRequired();

        entity.Property(x => x.Amount)
            .HasPrecision(14, 2)
            .IsRequired();

        entity.HasIndex(x => new
        {
            x.SettlementId,
            x.Category,
            x.Unit,
            x.UnitPrice
        }).IsUnique();
    }
}
