using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using TeaLedger.API.Data;
using TeaLedger.API.Models;

namespace TeaLedger.API.Tests;

public sealed class FinancialLedgerModelTests
{
    [Fact]
    public void LedgerConfiguration_KeepsUniqueLinksAndDirectionConstraints()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        using var db = new ApplicationDbContext(options);

        var entity = db.GetService<IDesignTimeModel>().Model.FindEntityType(
            typeof(FinancialLedgerEntry))!;
        var indexes = entity.GetIndexes();
        var collectionIndex = Assert.Single(indexes, index =>
            index.Properties.Select(property => property.Name)
                .SequenceEqual([nameof(FinancialLedgerEntry.CollectionId),
                    nameof(FinancialLedgerEntry.TransactionType)]));
        var deductionIndex = Assert.Single(indexes, index =>
            index.Properties.Select(property => property.Name)
                .SequenceEqual([nameof(FinancialLedgerEntry.DeductionId)]));
        var settlementIndex = Assert.Single(indexes, index =>
            index.Properties.Select(property => property.Name)
                .SequenceEqual([nameof(FinancialLedgerEntry.SettlementId)]));

        Assert.True(collectionIndex.IsUnique);
        Assert.True(deductionIndex.IsUnique);
        Assert.True(settlementIndex.IsUnique);

        Assert.Equal(14, entity.FindProperty(
            nameof(FinancialLedgerEntry.Amount))!
            .GetPrecision());
        Assert.Equal(2, entity.FindProperty(
            nameof(FinancialLedgerEntry.Amount))!
            .GetScale());
        Assert.Contains(entity.GetCheckConstraints(), constraint =>
            constraint.Name == "CK_FinancialLedgerEntries_Amount");
        Assert.Contains(entity.GetCheckConstraints(), constraint =>
            constraint.Name == "CK_FinancialLedgerEntries_ValidTransaction");
    }
}
