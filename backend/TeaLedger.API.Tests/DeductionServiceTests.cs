using TeaLedger.API.Services;

namespace TeaLedger.Tests;

public sealed class DeductionServiceTests
{
    [Theory]
    [InlineData(2, 1500, 3000)]
    [InlineData(1.5, 1000, 1500)]
    [InlineData(3, 125.50, 376.50)]
    [InlineData(0.333, 100, 33.30)]
    public void CalculateAmount_ReturnsRoundedAmount(
        decimal quantity,
        decimal unitPrice,
        decimal expected)
    {
        var result = DeductionService.CalculateAmount(
            quantity, unitPrice);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(0, 100)]
    [InlineData(-1, 100)]
    public void CalculateAmount_RejectsInvalidQuantity(
        decimal quantity,
        decimal unitPrice)
    {
        Assert.Throws<ArgumentException>(() =>
            DeductionService.CalculateAmount(
                quantity, unitPrice));
    }

    [Theory]
    [InlineData(1, 0)]
    [InlineData(1, -100)]
    public void CalculateAmount_RejectsInvalidUnitPrice(
        decimal quantity,
        decimal unitPrice)
    {
        Assert.Throws<ArgumentException>(() =>
            DeductionService.CalculateAmount(
                quantity, unitPrice));
    }
}