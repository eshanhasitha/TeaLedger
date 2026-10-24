using Microsoft.EntityFrameworkCore;
using TeaLedger.API.Data;
using TeaLedger.API.DTOs.Auth;
using TeaLedger.API.Interfaces;

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
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) ||
            string.IsNullOrEmpty(request.Password))
        {
            return null;
        }

        var phoneNumber = request.PhoneNumber.Trim();

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
}
