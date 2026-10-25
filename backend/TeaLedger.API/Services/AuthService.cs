using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Auth;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Models;

namespace TeaLedger.API.Services;

public sealed class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenService _jwtService;

    public AuthService(
        ApplicationDbContext db,
        IPasswordService passwordService,
        IJwtTokenService jwtService)
    {
        _db = db;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(request.PhoneNumber) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        var phoneNumber = NormalizePhone(
            request.PhoneNumber);

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.PhoneNumber == phoneNumber,
                cancellationToken);

        if (user is null)
        {
            return null;
        }

        if (!user.IsActive)
        {
            return null;
        }

        var passwordValid =
            _passwordService.VerifyPassword(
                request.Password,
                user.PasswordHash);

        if (!passwordValid)
        {
            return null;
        }

        var expiresAt =
            _jwtService.GetExpirationTime();

        var token =
            _jwtService.GenerateToken(
                user,
                expiresAt);

        return new LoginResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString()
        };
    }

    public async Task<RegisterResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        var fullName = request.FullName.Trim();

        var phoneNumber = NormalizePhone(
            request.PhoneNumber);

        if (string.IsNullOrWhiteSpace(fullName))
        {
            throw new ArgumentException(
                "Full name is required.");
        }

        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            throw new ArgumentException(
                "Phone number is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException(
                "Password is required.");
        }

        if (request.Password != request.ConfirmPassword)
        {
            throw new ArgumentException(
                "Passwords do not match.");
        }

        var existingUser =
            await _db.Users.AnyAsync(
                x => x.PhoneNumber == phoneNumber,
                cancellationToken);

        if (existingUser)
        {
            throw new InvalidOperationException(
                "A user with this phone number already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            PhoneNumber = phoneNumber,
            PasswordHash =
                _passwordService.HashPassword(
                    request.Password),
            // Public self-registration is limited to farmers.
            // Admin and Collector accounts must be provisioned by an administrator.
            Role = UserRole.Farmer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);

        await _db.SaveChangesAsync(
            cancellationToken);

        return new RegisterResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive
        };
    }

    public async Task<bool> ChangePasswordAsync(
        Guid userId,
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword) ||
            request.NewPassword != request.ConfirmNewPassword)
        {
            return false;
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(
                x => x.Id == userId,
                cancellationToken);

        if (user is null || !user.IsActive ||
            !_passwordService.VerifyPassword(
                request.CurrentPassword,
                user.PasswordHash))
        {
            return false;
        }

        user.PasswordHash = _passwordService.HashPassword(
            request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string NormalizePhone(
        string phoneNumber)
    {
        return phoneNumber
            .Trim()
            .Replace(" ", string.Empty)
            .Replace("-", string.Empty);
    }
}
