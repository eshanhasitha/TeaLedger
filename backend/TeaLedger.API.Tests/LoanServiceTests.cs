using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class LoanServiceTests
{
    [Fact]
    public void OutstandingBalance_ReturnsPrincipalBeforeRepayment()
    {
        var result =
            LoanService.CalculateOutstandingBalance(10000m, 0m);

        Assert.Equal(10000m, result);
    }

    [Fact]
    public void OutstandingBalance_SubtractsPartialRepayments()
    {
        var result =
            LoanService.CalculateOutstandingBalance(10000m, 2500m);

        Assert.Equal(7500m, result);
    }

    [Fact]
    public void OutstandingBalance_ReturnsZeroAfterFullRepayment()
    {
        var result =
            LoanService.CalculateOutstandingBalance(10000m, 10000m);

        Assert.Equal(0m, result);
    }

    [Fact]
    public void OutstandingBalance_RejectsRepaymentsAbovePrincipal()
    {
        Assert.Throws<InvalidOperationException>(() =>
            LoanService.CalculateOutstandingBalance(
                10000m, 10001m));
    }

    [Fact]
    public void OutstandingBalance_RejectsNegativeRepayments()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            LoanService.CalculateOutstandingBalance(
                10000m, -1m));
    }

    [Fact]
    public void RepaymentValidation_AcceptsPartialRepayment()
    {
        LoanService.ValidateRepaymentAmount(
            2500m,
            10000m);
    }

    [Fact]
    public void RepaymentValidation_AcceptsExactOutstandingBalance()
    {
        LoanService.ValidateRepaymentAmount(
            7500m,
            7500m);
    }

    [Fact]
    public void RepaymentValidation_RejectsZeroAmount()
    {
        Assert.Throws<ArgumentException>(() =>
            LoanService.ValidateRepaymentAmount(
                0m,
                10000m));
    }

    [Fact]
    public void RepaymentValidation_RejectsNegativeAmount()
    {
        Assert.Throws<ArgumentException>(() =>
            LoanService.ValidateRepaymentAmount(
                -10m,
                10000m));
    }

    [Fact]
    public void RepaymentValidation_RejectsOverpayment()
    {
        Assert.Throws<InvalidOperationException>(() =>
            LoanService.ValidateRepaymentAmount(
                10001m,
                10000m));
    }

    [Fact]
    public void RepaymentValidation_RejectsClosedLoan()
    {
        Assert.Throws<InvalidOperationException>(() =>
            LoanService.ValidateRepaymentAmount(
                100m,
                0m));
    }
}