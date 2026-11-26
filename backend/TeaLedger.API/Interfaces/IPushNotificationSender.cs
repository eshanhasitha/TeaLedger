
namespace TeaLedger.API.Interfaces;

public interface IPushNotificationSender
{
    bool IsConfigured { get; }

    Task SendAsync(
        string token,
        string title,
        string body,
        Dictionary<string, string> data,
        CancellationToken cancellationToken = default);
}