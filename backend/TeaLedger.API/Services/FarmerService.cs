using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Farmers;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class FarmerService : IFarmerService
{
    private readonly IFarmerRepository _repository;

    public FarmerService(IFarmerRepository repository)
    {
        _repository = repository;
    }

    // ---------------- ADMIN OPERATIONS ----------------

    public Task<FarmerListResponse> GetFarmersAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        CancellationToken cancellationToken = default)
    {
        return GetPagedResponseAsync(
            page, pageSize, search, isActive, null,
            cancellationToken);
    }

    public async Task<FarmerResponse?> GetFarmerByIdAsync(
        Guid farmerId,
        CancellationToken cancellationToken = default)
    {
        var farmer = await _repository.GetByIdAsync(
            farmerId, null, false, cancellationToken);

        return farmer is null ? null : MapToResponse(farmer);
    }

    public async Task<FarmerResponse> CreateFarmerAsync(
        CreateFarmerRequest request,
        CancellationToken cancellationToken = default)
    {
        var collectorId = request.CollectorId;

        if (collectorId.HasValue &&
            !await _repository.CollectorExistsAsync(
                collectorId.Value, cancellationToken))
        {
            throw new ArgumentException(
                "The selected collector does not exist.");
        }

        return await CreateCoreAsync(
            request, collectorId, cancellationToken);
    }

    public async Task<FarmerResponse?> UpdateFarmerAsync(
        Guid farmerId,
        UpdateFarmerRequest request,
        CancellationToken cancellationToken = default)
    {
        return await UpdateCoreAsync(
            farmerId, null, request, cancellationToken);
    }

    public async Task<bool> SetFarmerStatusAsync(
        Guid farmerId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        return await SetStatusCoreAsync(
            farmerId, null, isActive, cancellationToken);
    }

    // ---------------- COLLECTOR OPERATIONS ----------------

    public async Task<FarmerListResponse> GetCollectorFarmersAsync(
        Guid collectorUserId,
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        CancellationToken cancellationToken = default)
    {
        var collector = await GetCollectorAsync(
            collectorUserId, cancellationToken);

        return await GetPagedResponseAsync(
            page, pageSize, search, isActive,
            collector.Id, cancellationToken);
    }

    public async Task<FarmerResponse?> GetCollectorFarmerByIdAsync(
        Guid collectorUserId,
        Guid farmerId,
        CancellationToken cancellationToken = default)
    {
        var collector = await GetCollectorAsync(
            collectorUserId, cancellationToken);

        var farmer = await _repository.GetByIdAsync(
            farmerId, collector.Id, false, cancellationToken);

        return farmer is null ? null : MapToResponse(farmer);
    }

    public async Task<FarmerResponse> CreateCollectorFarmerAsync(
        Guid collectorUserId,
        CreateFarmerRequest request,
        CancellationToken cancellationToken = default)
    {
        var collector = await GetCollectorAsync(
            collectorUserId, cancellationToken);

        // Ignore request.CollectorId. The authenticated collector
        // determines ownership; clients cannot assign another collector.
        return await CreateCoreAsync(
            request, collector.Id, cancellationToken);
    }

    public async Task<FarmerResponse?> UpdateCollectorFarmerAsync(
        Guid collectorUserId,
        Guid farmerId,
        UpdateFarmerRequest request,
        CancellationToken cancellationToken = default)
    {
        var collector = await GetCollectorAsync(
            collectorUserId, cancellationToken);

        return await UpdateCoreAsync(
            farmerId, collector.Id, request, cancellationToken);
    }

    public async Task<bool> SetCollectorFarmerStatusAsync(
        Guid collectorUserId,
        Guid farmerId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var collector = await GetCollectorAsync(
            collectorUserId, cancellationToken);

        return await SetStatusCoreAsync(
            farmerId, collector.Id, isActive, cancellationToken);
    }

    // ---------------- SHARED BUSINESS LOGIC ----------------

    private async Task<Collector> GetCollectorAsync(
        Guid collectorUserId,
        CancellationToken cancellationToken)
    {
        var collector = await _repository.GetCollectorByUserIdAsync(
            collectorUserId, cancellationToken);

        if (collector is null)
        {
            throw new UnauthorizedAccessException(
                "The authenticated account is not a registered collector.");
        }

        return collector;
    }

    private async Task<FarmerListResponse> GetPagedResponseAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        Guid? collectorId,
        CancellationToken cancellationToken)
    {
        if (page < 1)
            throw new ArgumentException("Page must be at least 1.");

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException(
                "Page size must be between 1 and 100.");

        var result = await _repository.GetPagedAsync(
            page, pageSize, search, isActive,
            collectorId, cancellationToken);

        return new FarmerListResponse
        {
            Items = result.Items.Select(MapToResponse).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = result.TotalCount,
            TotalPages = (int)Math.Ceiling(
                result.TotalCount / (double)pageSize)
        };
    }

    private async Task<FarmerResponse> CreateCoreAsync(
        CreateFarmerRequest request,
        Guid? collectorId,
        CancellationToken cancellationToken)
    {
        if (request.UserId == Guid.Empty)
            throw new ArgumentException("A valid UserId is required.");

        var user = await _repository.GetUserAsync(
            request.UserId, cancellationToken);

        if (user is null)
            throw new ArgumentException(
                "The selected user does not exist.");

        if (user.Role != UserRole.Farmer)
            throw new ArgumentException(
                "The selected user must have the Farmer role.");

        if (!user.IsActive)
            throw new ArgumentException(
                "The selected farmer account is inactive.");

        if (await _repository.UserHasFarmerProfileAsync(
            request.UserId, cancellationToken))
        {
            throw new InvalidOperationException(
                "This user already has a farmer profile.");
        }

        var farmerCode = NormalizeFarmerCode(request.FarmerCode);

        if (await _repository.FarmerCodeExistsAsync(
            farmerCode, null, cancellationToken))
        {
            throw new InvalidOperationException(
                "This farmer code is already registered.");
        }

        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            CollectorId = collectorId,
            FarmerCode = farmerCode,
            Address = request.Address.Trim(),
            TeaLandSize = request.FarmSizeHectares,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(farmer, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var savedFarmer = await _repository.GetByIdAsync(
            farmer.Id, null, false, cancellationToken);

        return MapToResponse(savedFarmer!);
    }

    private async Task<FarmerResponse?> UpdateCoreAsync(
        Guid farmerId,
        Guid? collectorId,
        UpdateFarmerRequest request,
        CancellationToken cancellationToken)
    {
        var farmer = await _repository.GetByIdAsync(
            farmerId, collectorId, true, cancellationToken);

        if (farmer is null)
            return null;

        var farmerCode = NormalizeFarmerCode(request.FarmerCode);

        if (await _repository.FarmerCodeExistsAsync(
            farmerCode, farmerId, cancellationToken))
        {
            throw new InvalidOperationException(
                "Another farmer already uses this farmer code.");
        }

        farmer.FarmerCode = farmerCode;
        farmer.Address = request.Address.Trim();
        farmer.TeaLandSize = request.FarmSizeHectares;

        farmer.User.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        return MapToResponse(farmer);
    }

    private async Task<bool> SetStatusCoreAsync(
        Guid farmerId,
        Guid? collectorId,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var farmer = await _repository.GetByIdAsync(
            farmerId, collectorId, true, cancellationToken);

        if (farmer is null)
            return false;

        farmer.IsActive = isActive;
        farmer.User.IsActive = isActive;
        farmer.User.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string NormalizeFarmerCode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Farmer code is required.");

        return value.Trim()
            .Replace(" ", string.Empty)
            .ToUpperInvariant();
    }

    private static FarmerResponse MapToResponse(Farmer farmer)
    {
        return new FarmerResponse
        {
            FarmerId = farmer.Id,
            UserId = farmer.UserId,
            FullName = farmer.User.FullName,
            PhoneNumber = farmer.User.PhoneNumber,
            FarmerCode = farmer.FarmerCode,
            Address = farmer.Address ?? string.Empty,
            FarmSizeHectares = farmer.TeaLandSize ?? 0,
            IsActive = farmer.IsActive,
            CreatedAt = farmer.CreatedAt,
            UpdatedAt = farmer.User.UpdatedAt
        };
    }
}
