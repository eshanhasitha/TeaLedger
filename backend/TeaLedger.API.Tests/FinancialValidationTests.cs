using TeaLedger.API.Validation;

namespace TeaLedger.API.Tests;

public sealed class FinancialValidationTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(1234.56)]
    public void ValidateAmount_AcceptsNonnegativeTwoDecimalValues(decimal amount)
    {
        Assert.Equal(amount, FinancialValidation.ValidateAmount(
            amount, "amount"));
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(1.234)]
    [InlineData(1_000_000_001)]
    public void ValidateAmount_RejectsInvalidValues(decimal amount)
    {
        Assert.ThrowsAny<ArgumentException>(() =>
            FinancialValidation.ValidateAmount(amount, "amount"));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(10.125)]
    public void ValidateQuantity_AcceptsNonnegativeThreeDecimalValues(
        decimal quantity)
    {
        Assert.Equal(quantity, FinancialValidation.ValidateQuantity(
            quantity, "quantity"));
    }

    [Theory]
    [InlineData(-0.001)]
    [InlineData(1.2345)]
    public void ValidateQuantity_RejectsInvalidValues(decimal quantity)
    {
        Assert.ThrowsAny<ArgumentException>(() =>
            FinancialValidation.ValidateQuantity(quantity, "quantity"));
    }
}
