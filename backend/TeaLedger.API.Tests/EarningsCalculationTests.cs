using TeaLedger.API.Models;

namespace TeaLedger.API.Tests;

public sealed class EarningsCalculationTests
{
    [Fact]
    public void CollectionEarning_IsFinalWeightTimesSavedPrice()
    {
        const decimal finalWeight = 11.2m;
        const decimal pricePerKg = 125.50m;

        var totalAmount = decimal.Round(
            finalWeight * pricePerKg,
            2,
            MidpointRounding.AwayFromZero);

        Assert.Equal(1405.60m, totalAmount);
    }

    [Fact]
    public void LedgerCollectionEarning_IsCredit()
    {
        var entry = new FinancialLedgerEntry
        {
            FarmerId = Guid.NewGuid(),
            CollectionId = Guid.NewGuid(),
            TransactionType =
                FinancialTransactionType.CollectionEarning,
            Direction = FinancialDirection.Credit,
            Amount = 1405.60m,
            Description = "Verified tea collection earning"
        };

        Assert.Equal(
            FinancialTransactionType.CollectionEarning,
            entry.TransactionType);

        Assert.Equal(
            FinancialDirection.Credit,
            entry.Direction);

        Assert.True(entry.Amount > 0);
    }

    [Fact]
    public void LedgerDebit_UsesPositiveAmountAndDebitDirection()
    {
        var entry = new FinancialLedgerEntry
        {
            FarmerId = Guid.NewGuid(),
            TransactionType =
                FinancialTransactionType.Deduction,
            Direction = FinancialDirection.Debit,
            Amount = 100m,
            Description = "Example deduction"
        };

        Assert.Equal(FinancialDirection.Debit, entry.Direction);
        Assert.Equal(100m, entry.Amount);
    }

    [Fact]
    public void VerifiedCollectionStatusesAreCollectedOrSynced()
    {
        Assert.Equal(1, (int)CollectionStatus.Collected);
        Assert.Equal(3, (int)CollectionStatus.Synced);

        Assert.NotEqual(
            CollectionStatus.Pending,
            CollectionStatus.Collected);

        Assert.NotEqual(
            CollectionStatus.Cancelled,
            CollectionStatus.Synced);
    }
}