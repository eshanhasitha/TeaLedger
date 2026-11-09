
using TeaLedger.API.DTOs.Collectors;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class CollectorService : ICollectorService
{
    private readonly ICollectorRepository _repository;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<CollectorService> _logger;

    public CollectorService(
        ICollectorRepository repository,
        IPasswordService passwordService,
        ILogger<CollectorService> logger)
    {
        _repository = repository;
        _passwordService = passwordService;
        _logger = logger;
    }

    public async Task<(IReadOnlyList<CollectorDto> Items, int TotalCount)>
        GetCollectorsAsync(
            int page,
            int pageSize,
            string? search,
            bool? isActive,
            CancellationToken cancellationToken)
    {
        return await SearchCollectorsAsync(
            page, pageSize, search, null,
            isActive, cancellationToken);
    }

    public async Task<(IReadOnlyList<CollectorDto> Items, int TotalCount)>
        SearchCollectorsAsync(
            int page,
            int pageSize,
            string? search,
            string? area,
            bool? isActive,
            CancellationToken cancellationToken)
    {
        ValidatePagination(page, pageSize);

        var result = await _repository.GetPagedAsync(
            page,
            pageSize,
            search,
            area,
            isActive,
            cancellationToken);

        return (
            result.Items.Select(MapToDto).ToList(),
            result.TotalCount
        );
    }

    public async Task<CollectorDto?> GetCollectorByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var collector = await _repository.GetByIdAsync(
            id, false, cancellationToken);

        return collector is null ? null : MapToDto(collector);
    }

    public async Task<CollectorDto> CreateCollectorAsync(
        CreateCollectorDto request,
        CancellationToken cancellationToken)
    {
        var name = NormalizeRequired(request.FullName, "Full name", 100);
        var phone = NormalizePhone(request.PhoneNumber);
        var area = NormalizeArea(request.Area ?? request.Address);

        if (!_passwordService.IsValidPassword(request.Password))
        {
            throw new ArgumentException(
                "Password does not satisfy the password policy.");
        }

        if (await _repository.PhoneNumberExistsAsync(
            phone, null, cancellationToken))
        {
            throw new InvalidOperationException(
                "This phone number is already registered.");
        }

        var now = DateTime.UtcNow;

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = name,
            PhoneNumber = phone,
            PasswordHash = _passwordService.HashPassword(
                request.Password),
            Role = UserRole.Collector,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var collector = new Collector
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CollectorCode = GenerateCollectorCode(),
            Area = area,
            CreatedAt = now,
            User = user
        };

        await _repository.AddAsync(collector, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Collector profile created. CollectorId={CollectorId}, UserId={UserId}",
            collector.Id,
            user.Id);

        return MapToDto(collector);
    }

    public async Task<CollectorDto?> UpdateCollectorAsync(
        Guid id,
        UpdateCollectorDto request,
        CancellationToken cancellationToken)
    {
        var collector = await _repository.GetByIdAsync(
            id, true, cancellationToken);

        if (collector is null)
            return null;

        await UpdateCollectorDetailsAsync(
            collector, request, cancellationToken);

        return MapToDto(collector);
    }

    public async Task<bool> SetCollectorStatusAsync(
        Guid id,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var collector = await _repository.GetByIdAsync(
            id, true, cancellationToken);

        if (collector is null)
            return false;

        collector.User.IsActive = isActive;
        collector.User.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Collector status changed. CollectorId={CollectorId}, IsActive={IsActive}",
            collector.Id,
            isActive);

        return true;
    }

    public async Task<CollectorProfileDto?> GetMyProfileAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var collector = await _repository.GetByUserIdAsync(
            userId, false, cancellationToken);

        if (collector is null)
            return null;

        return MapToProfile(collector);
    }

    public async Task<CollectorProfileDto?> UpdateMyProfileAsync(
        Guid userId,
        UpdateCollectorDto request,
        CancellationToken cancellationToken)
    {
        var collector = await _repository.GetByUserIdAsync(
            userId, true, cancellationToken);

        if (collector is null)
            return null;

        await UpdateCollectorDetailsAsync(
            collector, request, cancellationToken);

        return MapToProfile(collector);
    }

    private async Task UpdateCollectorDetailsAsync(
        Collector collector,
        UpdateCollectorDto request,
        CancellationToken cancellationToken)
    {
        var name = NormalizeRequired(
            request.FullName, "Full name", 100);

        var phone = NormalizePhone(request.PhoneNumber);

        var area = NormalizeArea(
            request.Area ?? request.Address);

        if (await _repository.PhoneNumberExistsAsync(
            phone, collector.UserId, cancellationToken))
        {
            throw new InvalidOperationException(
                "This phone number is already registered.");
        }

        collector.User.FullName = name;
        collector.User.PhoneNumber = phone;
        collector.User.UpdatedAt = DateTime.UtcNow;
        collector.Area = area;

        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Collector profile updated. CollectorId={CollectorId}",
            collector.Id);
    }

    private static void ValidatePagination(int page, int pageSize)
    {
        if (page < 1)
            throw new ArgumentException("Page must be at least 1.");

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException(
                "Page size must be between 1 and 100.");
    }

    private static string NormalizeRequired(
        string? value,
        string field,
        int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"{field} is required.");

        var result = value.Trim();

        if (result.Length > maxLength)
            throw new ArgumentException(
                $"{field} cannot exceed {maxLength} characters.");

        return result;
    }

    private static string NormalizePhone(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Phone number is required.");

        var phone = value.Trim()
            .Replace(" ", "")
            .Replace("-", "");

        if (phone.Length > 20)
            throw new ArgumentException("Phone number is too long.");

        return phone;
    }

    private static string? NormalizeArea(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var area = value.Trim();

        if (area.Length < 2 || area.Length > 150)
            throw new ArgumentException(
                "Collection area must contain between 2 and 150 characters.");

        if (area.Any(char.IsControl))
            throw new ArgumentException(
                "Collection area contains invalid characters.");

        return area;
    }

    private static string GenerateCollectorCode() =>
        $"COL-{Guid.NewGuid():N}"[..10].ToUpperInvariant();

    private static CollectorDto MapToDto(Collector collector)
    {
        return new CollectorDto
        {
            Id = collector.Id,
            UserId = collector.UserId,
            CollectorCode = collector.CollectorCode,
            FullName = collector.User.FullName,
            PhoneNumber = collector.User.PhoneNumber,
            Address = collector.Area,
            IsActive = collector.User.IsActive,
            CreatedAt = collector.CreatedAt
        };
    }

    private static CollectorProfileDto MapToProfile(
        Collector collector)
    {
        return new CollectorProfileDto
        {
            Id = collector.Id,
            UserId = collector.UserId,
            CollectorCode = collector.CollectorCode,
            FullName = collector.User.FullName,
            PhoneNumber = collector.User.PhoneNumber,
            Area = collector.Area,
            IsActive = collector.User.IsActive,
            CreatedAt = collector.CreatedAt,
            AssignedFarmerCount = collector.Farmers.Count
        };
    }
}
