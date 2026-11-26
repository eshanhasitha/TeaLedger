using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class SettlementSecurityTests
{
    [Fact]
    public void CalculateNetSettlement_ReturnsCorrectAmount()
    {
        var result = SettlementService.CalculateNetSettlement(
            10000m,
            1500m,
            2000m);

        Assert.Equal(6500m, result);
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeIncome()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(-100m, 0m, 0m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeDeductions()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(1000m, -100m, 0m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeRepayments()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettlementService.CalculateNetSettlement(1000m, 100m, -50m));
    }

    [Fact]
    public void CalculateNetSettlement_RejectsNegativeNetAmount()
    {
        Assert.Throws<InvalidOperationException>(() =>
            SettlementService.CalculateNetSettlement(1000m, 700m, 500m));
    }

    [Fact]
    public void CalculateNetSettlement_RoundsToTwoDecimals()
    {
        var result = SettlementService.CalculateNetSettlement(
            100.555m,
            0m,
            0m);

        Assert.Equal(100.56m, result);
    }
}
