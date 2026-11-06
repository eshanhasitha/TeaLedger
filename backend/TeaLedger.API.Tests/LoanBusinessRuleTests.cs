using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class LoanBusinessRuleTests
{
    [Fact]
    public void CalculateOutstandingBalance_ReturnsPrincipalLessRepayments()
    {
        var outstanding = LoanService.CalculateOutstandingBalance(
            principalAmount: 100m,
            totalRepaid: 35.25m);

        Assert.Equal(64.75m, outstanding);
    }

    [Fact]
    public void CalculateOutstandingBalance_RoundsAwayFromZeroToTwoPlaces()
    {
        var outstanding = LoanService.CalculateOutstandingBalance(
            principalAmount: 10m,
            totalRepaid: 1.125m);

        Assert.Equal(8.88m, outstanding);
    }

    [Fact]
    public void CalculateOutstandingBalance_ThrowsWhenPrincipalIsNotPositive()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            LoanService.CalculateOutstandingBalance(0m, 0m));
    }

    [Fact]
    public void CalculateOutstandingBalance_ThrowsWhenRepaymentsAreNegative()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            LoanService.CalculateOutstandingBalance(10m, -1m));
    }

    [Fact]
    public void CalculateOutstandingBalance_ThrowsWhenRepaymentsExceedPrincipal()
    {
        Assert.Throws<InvalidOperationException>(() =>
            LoanService.CalculateOutstandingBalance(10m, 11m));
    }

    [Fact]
    public void ValidateRepaymentAmount_AcceptsPositiveAmountWithinBalance()
    {
        LoanService.ValidateRepaymentAmount(5m, 10m);
    }

    [Fact]
    public void ValidateRepaymentAmount_ThrowsWhenAmountIsNotPositive()
    {
        Assert.Throws<ArgumentException>(() =>
            LoanService.ValidateRepaymentAmount(0m, 10m));
    }

    [Fact]
    public void ValidateRepaymentAmount_ThrowsWhenBalanceIsNotPositive()
    {
        Assert.Throws<InvalidOperationException>(() =>
            LoanService.ValidateRepaymentAmount(1m, 0m));
    }

    [Fact]
    public void ValidateRepaymentAmount_ThrowsWhenAmountExceedsBalance()
    {
        Assert.Throws<InvalidOperationException>(() =>
            LoanService.ValidateRepaymentAmount(10.01m, 10m));
    }
}
