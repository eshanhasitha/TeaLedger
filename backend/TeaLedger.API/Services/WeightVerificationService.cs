using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Collections;
using TeaLedger.API.DTOs.Passbook;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public class WeightVerificationService
{
    private readonly ApplicationDbContext _db;

    public WeightVerificationService(ApplicationDbContext db)
    {
        _db = db;
    }

    public static decimal CalculateFinalWeight(
        decimal grossWeight,
        decimal waterReduction,
        decimal bagWeight,
        decimal otherReduction)
    {
        if (grossWeight <= 0)
            throw new ArgumentException(
                "Gross weight must be greater than zero.");

        if (waterReduction < 0 ||
            bagWeight < 0 ||
            otherReduction < 0)
        {
            throw new ArgumentException(
                "Weight reductions cannot be negative.");
        }

        var totalReduction =
            waterReduction + bagWeight + otherReduction;

        if (totalReduction > grossWeight)
            throw new ArgumentException(
                "Total reductions cannot exceed gross weight.");

        return decimal.Round(
            grossWeight - totalReduction,
            3,
            MidpointRounding.AwayFromZero);
    }

    public async Task<PassbookEntryDto?> VerifyAsync(
        Guid collectorUserId,
        Guid collectionId,
        VerifyWeightDto input,
        CancellationToken ct)
    {
        var collector = await _db.Collectors
            .SingleOrDefaultAsync(
                x => x.UserId == collectorUserId, ct);

        if (collector == null)
            throw new UnauthorizedAccessException(
                "Collector profile not found.");

        var collection = await _db.Collections
            .Include(x => x.Farmer)
            .SingleOrDefaultAsync(
                x => x.Id == collectionId &&
                     x.CollectorId == collector.Id, ct);

        if (collection == null)
            return null;

        if (collection.Status != CollectionStatus.Pending)
            throw new InvalidOperationException(
                "Only pending collections can be verified.");

        var alreadyVerified =
            await _db.WeightVerifications.AnyAsync(
                x => x.CollectionId == collectionId, ct);

        if (alreadyVerified)
            throw new InvalidOperationException(
                "This collection has already been verified.");

        var finalWeight = CalculateFinalWeight(
            input.GrossWeight,
            input.WaterReduction,
            input.BagWeight,
            input.OtherReduction);

        var totalReduction =
            input.WaterReduction +
            input.BagWeight +
            input.OtherReduction;

        var now = DateTime.UtcNow;

        await using var transaction =
            await _db.Database.BeginTransactionAsync(ct);

        collection.GrossWeight = input.GrossWeight;
        collection.WaterReduction = input.WaterReduction;
        collection.BagWeight = input.BagWeight;
        collection.OtherReduction = input.OtherReduction;
        collection.FinalWeight = finalWeight;
        collection.Status = CollectionStatus.Collected;
        collection.UpdatedAt = now;

        var verification = new WeightVerification
        {
            Id = Guid.NewGuid(),
            CollectionId = collection.Id,
            VerifiedByCollectorId = collector.Id,
            GrossWeight = input.GrossWeight,
            WaterReduction = input.WaterReduction,
            BagWeight = input.BagWeight,
            OtherReduction = input.OtherReduction,
            FinalWeight = finalWeight,
            VerifiedAt = now
        };

        var passbookEntry = new PassbookEntry
        {
            Id = Guid.NewGuid(),
            FarmerId = collection.FarmerId,
            CollectionId = collection.Id,
            GrossWeight = input.GrossWeight,
            TotalReduction = totalReduction,
            FinalWeight = finalWeight,
            RecordedAt = now
        };

        _db.WeightVerifications.Add(verification);
        _db.PassbookEntries.Add(passbookEntry);

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new PassbookEntryDto
        {
            Id = passbookEntry.Id,
            CollectionId = passbookEntry.CollectionId,
            GrossWeight = passbookEntry.GrossWeight,
            TotalReduction = passbookEntry.TotalReduction,
            FinalWeight = passbookEntry.FinalWeight,
            RecordedAt = passbookEntry.RecordedAt
        };
    }
}