using TeaLedger.API.Services;

namespace TeaLedger.API.Tests;

public class WeightVerificationServiceTests
{
    [Fact]
    public void CalculateFinalWeight_SubtractsAllReductions()
    {
        var result =
            WeightVerificationService.CalculateFinalWeight(
                30m,
                1m,
                0.5m,
                0.25m);

        Assert.Equal(28.25m, result);
    }

    [Fact]
    public void CalculateFinalWeight_RejectsZeroGrossWeight()
    {
        Assert.Throws<ArgumentException>(() =>
            WeightVerificationService.CalculateFinalWeight(
                0m, 0m, 0m, 0m));
    }

    [Fact]
    public void CalculateFinalWeight_RejectsNegativeReduction()
    {
        Assert.Throws<ArgumentException>(() =>
            WeightVerificationService.CalculateFinalWeight(
                10m, -1m, 0m, 0m));
    }

    [Fact]
    public void CalculateFinalWeight_RejectsReductionsAboveGross()
    {
        Assert.Throws<ArgumentException>(() =>
            WeightVerificationService.CalculateFinalWeight(
                10m, 6m, 3m, 2m));
    }

    [Fact]
    public void CalculateFinalWeight_RoundsToThreeDecimalPlaces()
    {
        var result =
            WeightVerificationService.CalculateFinalWeight(
                10.1239m,
                0m,
                0m,
                0m);

        Assert.Equal(10.124m, result);
    }
}