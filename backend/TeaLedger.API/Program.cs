using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using TeaLedger.API.Authorization;
using TeaLedger.API.Configuration;
using TeaLedger.API.Data;
using TeaLedger.API.Data.Seeds;
using TeaLedger.API.Interfaces;
using TeaLedger.API.Services;
using Serilog;
using TeaLedger.API.Middleware;
ApplicationConfiguration.LoadEnvironmentFile();
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(builder.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

var jwtSecret =
    Environment.GetEnvironmentVariable("JWT__Secret") ??
    Environment.GetEnvironmentVariable("JWT__Key");
if (!string.IsNullOrWhiteSpace(jwtSecret))
{
    builder.Configuration["Jwt:Key"] = jwtSecret;
}

builder.Configuration["Jwt:Issuer"] ??= "TeaLedger.API";
builder.Configuration["Jwt:Audience"] ??= "TeaLedger.Client";
builder.Configuration["Jwt:ExpiresInMinutes"] ??= "60";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "TeaLedger API",
            Version = "v1"
        });

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Paste the access token returned by the login endpoint. Do not include the 'Bearer ' prefix."
        });

    options.AddSecurityRequirement(
        _ => new OpenApiSecurityRequirement
        {
            {
                    new OpenApiSecuritySchemeReference(
                        "Bearer",
                        null),
                new List<string>()
            }
        });
});

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString(
                "DefaultConnection")));

var jwtSettings = ApplicationConfiguration.BindJwtSettings(builder.Configuration);
builder.Services.AddSingleton(jwtSettings);
builder.Services
    .AddAuthentication(
        options =>
        {
            options.DefaultAuthenticateScheme =
                JwtBearerDefaults.AuthenticationScheme;

            options.DefaultChallengeScheme =
                JwtBearerDefaults.AuthenticationScheme;
        })
    .AddJwtBearer(
        options =>
        {
            options.MapInboundClaims = false;

            options.SaveToken = false;

            options.RequireHttpsMetadata =
                !builder.Environment.IsDevelopment();

            options.TokenValidationParameters =
                new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,

                    IssuerSigningKey =
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                jwtSettings.Key)),

                    ValidateIssuer = true,

                    ValidIssuer =
                        jwtSettings.Issuer,

                    ValidateAudience = true,

                    ValidAudience =
                        jwtSettings.Audience,

                    ValidateLifetime = true,

                    RequireExpirationTime = true,

                    RequireSignedTokens = true,

                    ClockSkew =
                        TimeSpan.FromMinutes(1),

                    NameClaimType =
                        JwtRegisteredClaimNames.Name,

                    RoleClaimType =
                        "role"
                };
        });

builder.Services.AddAuthorization(
    options =>
    {
        options.AddPolicy(
            AuthorizationPolicies.AdminOnly,
            policy =>
                policy.RequireRole("Admin"));

        options.AddPolicy(
            AuthorizationPolicies.CollectorOnly,
            policy =>
                policy.RequireRole("Collector"));

        options.AddPolicy(
            AuthorizationPolicies.FarmerOnly,
            policy =>
                policy.RequireRole("Farmer"));
    });

builder.Services.AddScoped<
    IPasswordService,
    PasswordService>();

builder.Services.AddScoped<
    IJwtTokenService,
    JwtService>();

builder.Services.AddScoped<
    IAuthService,
    AuthService>();
builder.Services.AddHostedService<DatabaseSeedHostedService>();

builder.Services.AddScoped<
    IUserManagementService,
    UserManagementService>();

builder.Services.AddScoped<IFarmerService, FarmerService>();

builder.Services.AddScoped<
    ICollectorService,
    CollectorService>();

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy(
            "TeaLedgerPolicy",
            policy =>
            {
                policy
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


if (app.Environment.IsDevelopment())
{
    await using var scope = app.Services.CreateAsyncScope();

    var db = scope.ServiceProvider
        .GetRequiredService<ApplicationDbContext>();

    var logger = scope.ServiceProvider
        .GetRequiredService<ILoggerFactory>()
        .CreateLogger("DevelopmentDatabaseInitializer");

    await DevelopmentDatabaseInitializer.InitializeAsync(db, logger);
}


app.UseHttpsRedirection();
app.UseSerilogRequestLogging();
app.UseCors("TeaLedgerPolicy");
app.UseMiddleware<ApiExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

public partial class Program { }
