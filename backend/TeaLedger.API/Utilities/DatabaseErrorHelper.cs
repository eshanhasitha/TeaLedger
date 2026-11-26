using Npgsql;

namespace TeaLedger.API.Utilities;

public static class DatabaseErrorHelper
{
    public static bool IsUniqueViolation(Exception exception)
    {
        return FindPostgresException(exception)?.SqlState
            == PostgresErrorCodes.UniqueViolation;
    }

    public static bool IsSerializationFailure(Exception exception)
    {
        return FindPostgresException(exception)?.SqlState
            == PostgresErrorCodes.SerializationFailure;
    }

    public static bool IsDeadlock(Exception exception)
    {
        return FindPostgresException(exception)?.SqlState
            == PostgresErrorCodes.DeadlockDetected;
    }

    private static PostgresException? FindPostgresException(
        Exception exception)
    {
        for (Exception? current = exception;
             current is not null;
             current = current.InnerException)
        {
            if (current is PostgresException postgres)
                return postgres;
        }

        return null;
    }
}
