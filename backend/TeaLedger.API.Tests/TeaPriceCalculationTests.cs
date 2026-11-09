using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public sealed class TeaPriceCalculationTests
{
    [Fact]
    public void CalculateAmount_ReturnsCorrectAmount()
    {
        var amount = TeaPriceService.CalculateAmount(
            finalWeight: 10m,
            pricePerKg: 125m);

        Assert.Equal(1250m, amount);
    }

    [Fact]
    public void CalculateAmount_RoundsToTwoDecimalPlaces()
    {
        var amount = TeaPriceService.CalculateAmount(
            finalWeight: 1.234m,
            pricePerKg: 100.50m);

        Assert.Equal(124.02m, amount);
    }

    [Fact]
    public void CalculateAmount_UsesAwayFromZeroRounding()
    {
        var amount = TeaPriceService.CalculateAmount(
            finalWeight: 1m,
            pricePerKg: 10.125m);

        Assert.Equal(10.13m, amount);
    }

    [Fact]
    public void CalculateAmount_ThrowsWhenWeightIsZero()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            TeaPriceService.CalculateAmount(0m, 100m));
    }

    [Fact]
    public void CalculateAmount_ThrowsWhenWeightIsNegative()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            TeaPriceService.CalculateAmount(-1m, 100m));
    }

    [Fact]
    public void CalculateAmount_ThrowsWhenPriceIsZero()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            TeaPriceService.CalculateAmount(10m, 0m));
    }

    [Fact]
    public void CalculateAmount_ThrowsWhenPriceIsNegative()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            TeaPriceService.CalculateAmount(10m, -100m));
    }
}