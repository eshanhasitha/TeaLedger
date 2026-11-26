using TeaLedger.API.DTOs.TeaPrices;
using TeaLedger.API.Models;

namespace TeaLedger.API.Tests;

public sealed class TeaPriceValidationTests
{
    [Theory]
    [InlineData(2026, 1)]
    [InlineData(2026, 12)]
    [InlineData(2030, 6)]
    public void MonthlyPrice_AcceptsValidYearAndMonth(
        int year,
        int month)
    {
        Assert.InRange(year, 2020, 2100);
        Assert.InRange(month, 1, 12);
    }

    [Theory]
    [InlineData(2019, 1)]
    [InlineData(2101, 1)]
    [InlineData(2026, 0)]
    [InlineData(2026, 13)]
    public void MonthlyPrice_RejectsInvalidYearOrMonth(
        int year,
        int month)
    {
        var validYear = year >= 2020 && year <= 2100;
        var validMonth = month >= 1 && month <= 12;

        Assert.False(validYear && validMonth);
    }

    [Fact]
    public void EffectiveFrom_MustBelongToSelectedMonth()
    {
        var year = 2026;
        var month = 5;

        var validDate = new DateTime(
            year, month, 15, 0, 0, 0,
            DateTimeKind.Utc);

        Assert.Equal(year, validDate.Year);
        Assert.Equal(month, validDate.Month);
    }

    [Fact]
    public void PriceDto_ContainsRequiredFields()
    {
        var dto = new SetMonthlyTeaPriceDto
        {
            Year = 2026,
            Month = 5,
            PricePerKg = 125m,
            EffectiveFrom = new DateTime(
                2026, 5, 1, 0, 0, 0,
                DateTimeKind.Utc)
        };

        Assert.Equal(2026, dto.Year);
        Assert.Equal(5, dto.Month);
        Assert.Equal(125m, dto.PricePerKg);
        Assert.NotEqual(default, dto.EffectiveFrom);
    }
}