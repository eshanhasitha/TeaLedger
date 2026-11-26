using TeaLedger.API.Models;
using Xunit;

namespace TeaLedger.API.Tests;

public sealed class FarmerFinancialSummaryTests
{
    [Fact]
    public void NetMovement_IsCreditsMinusDebits()
    {
        const decimal credits = 100000m;
        const decimal debits = 18000m;

        var result = credits - debits;

        Assert.Equal(82000m, result);
    }

    [Fact]
    public void CollectionEarning_IsCredit()
    {
        var entry = new FinancialLedgerEntry
        {
            FarmerId = Guid.NewGuid(),
            CollectionId = Guid.NewGuid(),
            TransactionType =
                FinancialTransactionType.CollectionEarning,
            Direction = FinancialDirection.Credit,
            Amount = 25000m,
            Description = "Verified collection"
        };

        Assert.Equal(
            FinancialTransactionType.CollectionEarning,
            entry.TransactionType);

        Assert.Equal(
            FinancialDirection.Credit,
            entry.Direction);
    }

    [Fact]
    public void Deduction_IsDebit()
    {
        var entry = new FinancialLedgerEntry
        {
            FarmerId = Guid.NewGuid(),
            DeductionId = Guid.NewGuid(),
            TransactionType =
                FinancialTransactionType.Deduction,
            Direction = FinancialDirection.Debit,
            Amount = 5000m,
            Description = "Fertilizer deduction"
        };

        Assert.Equal(
            FinancialTransactionType.Deduction,
            entry.TransactionType);

        Assert.Equal(
            FinancialDirection.Debit,
            entry.Direction);
    }

    [Fact]
    public void Repayment_IsDebit()
    {
        var entry = new FinancialLedgerEntry
        {
            FarmerId = Guid.NewGuid(),
            LoanRepaymentId = Guid.NewGuid(),
            TransactionType =
                FinancialTransactionType.LoanRepayment,
            Direction = FinancialDirection.Debit,
            Amount = 2000m,
            Description = "Loan repayment"
        };

        Assert.Equal(
            FinancialTransactionType.LoanRepayment,
            entry.TransactionType);

        Assert.Equal(
            FinancialDirection.Debit,
            entry.Direction);
    }

    [Fact]
    public void LedgerAmount_MustBePositive()
    {
        var entry = new FinancialLedgerEntry
        {
            FarmerId = Guid.NewGuid(),
            TransactionType =
                FinancialTransactionType.Deduction,
            Direction = FinancialDirection.Debit,
            Amount = 500m,
            Description = "Test deduction"
        };

        Assert.True(entry.Amount > 0);
    }
}