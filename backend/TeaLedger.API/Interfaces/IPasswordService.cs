namespace TeaLedger.API.Interfaces;

public interface IPasswordService
{
    bool IsValidPassword(string password);

    string HashPassword(string password);

    bool VerifyPassword(
        string password,
        string passwordHash);
}
