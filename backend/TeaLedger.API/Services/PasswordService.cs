using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Services;

public sealed class PasswordService : IPasswordService
{
    public bool IsValidPassword(string password)
    {
        return !string.IsNullOrWhiteSpace(password) &&
            password.Length is >= 8 and <= 100;
    }

    public string HashPassword(string password)
    {
        if (!IsValidPassword(password))
        {
            throw new ArgumentException(
                "Password must be between 8 and 100 characters.",
                nameof(password));
        }

        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(
        string password,
        string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        return BCrypt.Net.BCrypt.Verify(
            password,
            passwordHash);
    }
}
