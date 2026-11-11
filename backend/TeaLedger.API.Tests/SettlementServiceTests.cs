
using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class SettlementServiceTests
{
    [Fact]
    public void CalculateNetSettlement_SubtractsDeductionsAndRepayments()
    {
        var result = SettlementService.CalculateNetSettlement(
            50000m,
            5000m,
            10000m);

        Assert.Equal(35000m, result);
    }

    [Fact]
    public void CalculateNetSettlement_AllowsNoDeductions()
    {
        var result = SettlementService.CalculateNetSettlement(
            25000m,
            0m,
            0m);

        Assert.Equal(25000m, result);
    }

    [Fact]
    public void CalculateNetSettlement_AllowsZeroNetAmount()
    {
        var result = SettlementService.CalculateNetSettlement(
            15000m,
            10000m,
            5000m);

        Assert.Equal(0m, result);
    }

    [Fact]
    public void CalculateNetSettlement_RoundsToTwoDecimalPlaces()
    {
        var result = SettlementService.CalculateNetSettlement(
            1000.999m,
            100.111m,
            50.111m);

        Assert.Equal(850.78m, result);
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeIncome()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(
                -100m, 0m, 0m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeDeduction()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(
                1000m, -10m, 0m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeRepayment()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(
                1000m, 0m, -10m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeResult()
    {
        Assert.Throws<InvalidOperationException>(() =>
            SettlementService.CalculateNetSettlement(
                1000m, 700m, 400m));
    }
}
