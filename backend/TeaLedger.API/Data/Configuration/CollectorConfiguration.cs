
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeaLedger.API.Models;

namespace TeaLedger.API.Data.Configuration;

public sealed class CollectorConfiguration
    : IEntityTypeConfiguration<Collector>
{
    public void Configure(
        EntityTypeBuilder<Collector> builder)
    {
        builder.ToTable("Collectors");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CollectorCode)
            .IsRequired();

        builder.Property(c => c.Area);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.HasIndex(c => c.CollectorCode)
            .IsUnique();

        builder.HasIndex(c => c.UserId)
            .IsUnique();

        builder.HasIndex(c => c.Area);

        builder.HasOne(c => c.User)
            .WithOne(u => u.Collector)
            .HasForeignKey<Collector>(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Farmers)
            .WithOne(f => f.Collector)
            .HasForeignKey(f => f.CollectorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
