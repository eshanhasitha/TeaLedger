
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using TeaLedger.API.Interfaces;
using Google.Apis.Auth.OAuth2;

namespace TeaLedger.API.Services;

public sealed class FirebasePushNotificationSender
    : IPushNotificationSender
{
    private readonly FirebaseApp? _firebaseApp;

    public FirebasePushNotificationSender(IConfiguration configuration)
    {
        var credentialsPath =
            configuration["Firebase:CredentialsPath"] ??
            Environment.GetEnvironmentVariable(
                "GOOGLE_APPLICATION_CREDENTIALS");

        if (string.IsNullOrWhiteSpace(credentialsPath) ||
            !File.Exists(credentialsPath))
        {
            _firebaseApp = null;
            return;
        }

        _firebaseApp = FirebaseApp.Create(new AppOptions
        {
            Credential = CredentialFactory
                .FromFile<ServiceAccountCredential>(credentialsPath)
                .ToGoogleCredential()
        });
    }

    public bool IsConfigured => _firebaseApp is not null;

    public async Task SendAsync(
        string token,
        string title,
        string body,
        Dictionary<string, string> data,
        CancellationToken cancellationToken = default)
    {
        if (_firebaseApp is null)
        {
            throw new InvalidOperationException(
                "Firebase is not configured. Set " +
                "GOOGLE_APPLICATION_CREDENTIALS.");
        }

        cancellationToken.ThrowIfCancellationRequested();

        var message = new Message
        {
            Fid = token,

            Notification = new FirebaseAdmin.Messaging.Notification
            {
                Title = title,
                Body = body
            },

            Data = data,

            Android = new AndroidConfig
            {
                Priority = Priority.High
            },

            Apns = new ApnsConfig
            {
                Headers = new Dictionary<string, string>
                {
                    ["apns-priority"] = "10"
                }
            }
        };

        await FirebaseMessaging
            .GetMessaging(_firebaseApp)
            .SendAsync(message, cancellationToken);
    }
}
