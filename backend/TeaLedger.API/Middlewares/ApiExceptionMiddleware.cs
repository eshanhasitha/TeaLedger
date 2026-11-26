
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace TeaLedger.API.Middleware;

public sealed class ApiExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiExceptionMiddleware> _logger;

    public ApiExceptionMiddleware(
        RequestDelegate next,
        ILogger<ApiExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
                throw;

            var (statusCode, title, detail) = exception switch
            {
                ArgumentException => (
                    StatusCodes.Status400BadRequest,
                    "Invalid request",
                    exception.Message),
                UnauthorizedAccessException => (
                    StatusCodes.Status403Forbidden,
                    "Forbidden",
                    exception.Message),
                KeyNotFoundException => (
                    StatusCodes.Status404NotFound,
                    "Resource not found",
                    exception.Message),
                InvalidOperationException => (
                    StatusCodes.Status409Conflict,
                    "Request conflict",
                    exception.Message),
                _ => (
                    StatusCodes.Status500InternalServerError,
                    "Server error",
                    "An unexpected server error occurred.")
            };

            if (statusCode >= 500)
            {
                _logger.LogError(
                    exception,
                    "Unhandled error for {Method} {Path}",
                    context.Request.Method,
                    context.Request.Path);
            }
            else
            {
                _logger.LogWarning(
                    exception,
                    "Request failed for {Method} {Path} with status {StatusCode}",
                    context.Request.Method,
                    context.Request.Path,
                    statusCode);
            }

            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";

            var problem = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Type = $"https://httpstatuses.com/{statusCode}"
            };
            problem.Extensions["traceId"] = context.TraceIdentifier;

            await JsonSerializer.SerializeAsync(
                context.Response.Body,
                problem,
                cancellationToken: context.RequestAborted);
        }
    }
}
