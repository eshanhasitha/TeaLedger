namespace TeaLedger.API.Validation;

public static class FinancialValidation
{
    public static decimal ValidateAmount(
        decimal amount,
        string fieldName,
        decimal maximum = 1_000_000_000m)
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(
                fieldName,
                $"{fieldName} cannot be negative.");
        }

        if (amount > maximum)
        {
            throw new ArgumentOutOfRangeException(
                fieldName,
                $"{fieldName} exceeds the maximum allowed amount.");
        }

        if (decimal.Round(
                amount,
                2,
                MidpointRounding.AwayFromZero) != amount)
        {
            throw new ArgumentException(
                $"{fieldName} must have at most two decimal places.",
                fieldName);
        }

        return amount;
    }

    public static decimal ValidateQuantity(
        decimal quantity,
        string fieldName,
        decimal maximum = 1_000_000_000m)
    {
        if (quantity < 0)
        {
            throw new ArgumentOutOfRangeException(
                fieldName,
                $"{fieldName} cannot be negative.");
        }

        if (quantity > maximum)
        {
            throw new ArgumentOutOfRangeException(
                fieldName,
                $"{fieldName} exceeds the maximum allowed quantity.");
        }

        if (decimal.Round(
                quantity,
                3,
                MidpointRounding.AwayFromZero) != quantity)
        {
            throw new ArgumentException(
                $"{fieldName} must have at most three decimal places.",
                fieldName);
        }

        return quantity;
    }

    public static decimal ValidatePositiveAmount(
        decimal amount,
        string fieldName,
        decimal maximum = 1_000_000_000m)
    {
        ValidateAmount(amount, fieldName, maximum);
        if (amount == 0)
        {
            throw new ArgumentOutOfRangeException(
                fieldName,
                $"{fieldName} must be greater than zero.");
        }

        return amount;
    }

    public static decimal ValidatePositiveQuantity(
        decimal quantity,
        string fieldName,
        decimal maximum = 1_000_000_000m)
    {
        ValidateQuantity(quantity, fieldName, maximum);
        if (quantity == 0)
        {
            throw new ArgumentOutOfRangeException(
                fieldName,
                $"{fieldName} must be greater than zero.");
        }

        return quantity;
    }
}
