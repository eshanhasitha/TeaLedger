using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using TeaLedger.API.Middleware;

namespace TeaLedger.API.Tests;

public sealed class ApiExceptionMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_MapsArgumentExceptionToProblemDetails()
    {
        var middleware = new ApiExceptionMiddleware(
            _ => throw new ArgumentException("Invalid amount."),
            NullLogger<ApiExceptionMiddleware>.Instance);
        var context = new DefaultHttpContext();
        context.TraceIdentifier = "test-trace";
        await using var body = new MemoryStream();
        context.Response.Body = body;

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status400BadRequest,
            context.Response.StatusCode);
        Assert.Equal("application/problem+json",
            context.Response.ContentType);
        body.Position = 0;
        using var payload = await JsonDocument.ParseAsync(body);
        Assert.Equal("Invalid request",
            payload.RootElement.GetProperty("title").GetString());
        Assert.Equal("Invalid amount.",
            payload.RootElement.GetProperty("detail").GetString());
        Assert.Equal("test-trace",
            payload.RootElement.GetProperty("traceId").GetString());
    }

    [Fact]
    public async Task InvokeAsync_HidesUnexpectedExceptionDetails()
    {
        var middleware = new ApiExceptionMiddleware(
            _ => throw new Exception("database secret"),
            NullLogger<ApiExceptionMiddleware>.Instance);
        var context = new DefaultHttpContext();
        await using var body = new MemoryStream();
        context.Response.Body = body;

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status500InternalServerError,
            context.Response.StatusCode);
        body.Position = 0;
        using var payload = await JsonDocument.ParseAsync(body);
        Assert.DoesNotContain(
            "database secret",
            payload.RootElement.GetProperty("detail").GetString());
    }
}
