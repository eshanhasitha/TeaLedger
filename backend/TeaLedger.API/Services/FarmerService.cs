
using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Farmers;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public class FarmerService : IFarmerService
{
    private readonly ApplicationDbContext _db;

    public FarmerService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<FarmerListResponse> GetFarmersAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        IQueryable<Farmer> query = _db.Farmers
            .AsNoTracking()
            .Include(f => f.User);

        if (!string.IsNullOrWhiteSpace(search))
        {
            string term = search.Trim().ToLower();

            query = query.Where(f =>
                f.FarmerCode.ToLower().Contains(term) ||
                (f.Address != null && f.Address.ToLower().Contains(term)) ||
                f.User.FullName.ToLower().Contains(term) ||
                f.User.PhoneNumber.Contains(term));
        }

        if (isActive.HasValue)
        {
            query = query.Where(f => f.IsActive == isActive.Value);
        }

        int totalCount = await query.CountAsync(cancellationToken);

        var farmers = await query
            .OrderBy(f => f.User.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new FarmerListResponse
        {
            Items = farmers.Select(MapToResponse).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize)
        };
    }

    public async Task<FarmerResponse?> GetFarmerByIdAsync(
        Guid farmerId,
        CancellationToken cancellationToken = default)
    {
        var farmer = await _db.Farmers
            .AsNoTracking()
            .Include(f => f.User)
            .FirstOrDefaultAsync(
                f => f.Id == farmerId,
                cancellationToken);

        return farmer is null ? null : MapToResponse(farmer);
    }

    public async Task<FarmerResponse> CreateFarmerAsync(
        CreateFarmerRequest request,
        CancellationToken cancellationToken = default)
    {
        string farmerCode = NormalizeFarmerCode(request.FarmerCode);

        bool userExists = await _db.Users
            .AnyAsync(u => u.Id == request.UserId, cancellationToken);

        if (!userExists)
        {
            throw new InvalidOperationException(
                "The specified user account does not exist.");
        }

        bool alreadyHasProfile = await _db.Farmers
            .AnyAsync(
                f => f.UserId == request.UserId,
                cancellationToken);

        if (alreadyHasProfile)
        {
            throw new InvalidOperationException(
                "This user already has a farmer profile.");
        }

        bool farmerCodeExists = await _db.Farmers
            .AnyAsync(
                f => f.FarmerCode.ToLower() == farmerCode.ToLower(),
                cancellationToken);

        if (farmerCodeExists)
        {
            throw new InvalidOperationException(
                "A farmer profile with this code already exists.");
        }

        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            FarmerCode = farmerCode,
            Address = request.Address.Trim(),
            TeaLandSize = request.FarmSizeHectares,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Farmers.Add(farmer);

        await _db.SaveChangesAsync(cancellationToken);

        await _db.Entry(farmer)
            .Reference(f => f.User)
            .LoadAsync(cancellationToken);

        return MapToResponse(farmer);
    }

    public async Task<FarmerResponse?> UpdateFarmerAsync(
        Guid farmerId,
        UpdateFarmerRequest request,
        CancellationToken cancellationToken = default)
    {
        var farmer = await _db.Farmers
            .Include(f => f.User)
            .FirstOrDefaultAsync(
                f => f.Id == farmerId,
                cancellationToken);

        if (farmer is null)
        {
            return null;
        }

        string farmerCode = NormalizeFarmerCode(request.FarmerCode);

        bool farmerCodeExists = await _db.Farmers
            .AnyAsync(
                f => f.Id != farmerId &&
                     f.FarmerCode.ToLower() == farmerCode.ToLower(),
                cancellationToken);

        if (farmerCodeExists)
        {
            throw new InvalidOperationException(
                "Another farmer already uses this code.");
        }

        farmer.FarmerCode = farmerCode;
        farmer.Address = request.Address.Trim();
        farmer.TeaLandSize = request.FarmSizeHectares;

        await _db.SaveChangesAsync(cancellationToken);

        return MapToResponse(farmer);
    }

    public async Task<bool> SetFarmerStatusAsync(
        Guid farmerId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var farmer = await _db.Farmers
            .FirstOrDefaultAsync(
                f => f.Id == farmerId,
                cancellationToken);

        if (farmer is null)
        {
            return false;
        }

        farmer.IsActive = isActive;
        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string NormalizeFarmerCode(string farmerCode)
    {
        return farmerCode.Trim().Replace(" ", string.Empty);
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
            UpdatedAt = null
        };
    }
}
