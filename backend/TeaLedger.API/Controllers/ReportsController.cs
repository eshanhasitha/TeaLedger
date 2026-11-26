using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.Services;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public sealed class ReportsController : ControllerBase
{
    private readonly ReportService _reports;

    public ReportsController(ReportService reports)
    {
        _reports = reports;
    }

    private Guid CurrentUserId()
    {
        var value = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(value, out var userId))
            throw new UnauthorizedAccessException("Invalid JWT subject claim.");

        return userId;
    }

    private static string CsvCell(string? value)
    {
        value ??= string.Empty;
        return "\"" + value.Replace("\"", "\"\"") + "\"";
    }

    private static string CsvNumber(decimal value) =>
        value.ToString(CultureInfo.InvariantCulture);

    private FileContentResult CsvFile(string fileName, string content)
    {
        var bytes = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true)
            .GetBytes(content);

        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    [HttpGet("collections")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> Collections(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? farmerId,
        [FromQuery] Guid? collectorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            return Ok(await _reports.GetCollectionsAsync(
                from, to, farmerId, collectorId, page, pageSize, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("earnings")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> Earnings(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? farmerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            return Ok(await _reports.GetEarningsAsync(
                from, to, farmerId, page, pageSize, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("deductions")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> Deductions(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? farmerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            return Ok(await _reports.GetDeductionsAsync(
                from, to, farmerId, page, pageSize, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("collections/export")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> ExportCollections(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? farmerId,
        [FromQuery] Guid? collectorId,
        CancellationToken ct)
    {
        try
        {
            // Export is deliberately capped at 100 rows per request.
            var report = await _reports.GetCollectionsAsync(
                from, to, farmerId, collectorId, 1, 100, ct);

            if (report.TotalCount > 100)
                return BadRequest(new
                {
                    message = "Export is limited to 100 rows. Narrow the date range."
                });

            var csv = new StringBuilder();
            csv.AppendLine(
                "CollectionId,FarmerId,FarmerName,CollectorId,CollectorName,GrossWeight,FinalWeight,PricePerKg,TotalAmount,Status,CollectedAt");

            foreach (var row in report.Items)
            {
                csv.AppendLine(string.Join(",",
                    CsvCell(row.CollectionId.ToString()),
                    CsvCell(row.FarmerId.ToString()),
                    CsvCell(row.FarmerName),
                    CsvCell(row.CollectorId?.ToString()),
                    CsvCell(row.CollectorName),
                    CsvNumber(row.GrossWeight),
                    CsvNumber(row.FinalWeight),
                    CsvNumber(row.PricePerKg),
                    CsvNumber(row.TotalAmount),
                    CsvCell(row.Status),
                    CsvCell(row.CollectedAt.ToString("O"))));
            }

            return CsvFile("collections-report.csv", csv.ToString());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("earnings/export")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> ExportEarnings(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? farmerId,
        CancellationToken ct)
    {
        try
        {
            var report = await _reports.GetEarningsAsync(
                from, to, farmerId, 1, 100, ct);

            if (report.TotalCount > 100)
                return BadRequest(new
                {
                    message = "Export is limited to 100 rows. Narrow the date range."
                });

            var csv = new StringBuilder();
            csv.AppendLine(
                "LedgerEntryId,FarmerId,FarmerName,Amount,Description,Reference,OccurredAt");

            foreach (var row in report.Items)
            {
                csv.AppendLine(string.Join(",",
                    CsvCell(row.LedgerEntryId.ToString()),
                    CsvCell(row.FarmerId.ToString()),
                    CsvCell(row.FarmerName),
                    CsvNumber(row.Amount),
                    CsvCell(row.Description),
                    CsvCell(row.Reference),
                    CsvCell(row.OccurredAt.ToString("O"))));
            }

            return CsvFile("earnings-report.csv", csv.ToString());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("deductions/export")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> ExportDeductions(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? farmerId,
        CancellationToken ct)
    {
        try
        {
            var report = await _reports.GetDeductionsAsync(
                from, to, farmerId, 1, 100, ct);

            if (report.TotalCount > 100)
                return BadRequest(new
                {
                    message = "Export is limited to 100 rows. Narrow the date range."
                });

            var csv = new StringBuilder();
            csv.AppendLine(
                "DeductionId,FarmerId,FarmerName,Category,Description,Quantity,Unit,UnitPrice,Amount,OccurredAt");

            foreach (var row in report.Items)
            {
                csv.AppendLine(string.Join(",",
                    CsvCell(row.DeductionId.ToString()),
                    CsvCell(row.FarmerId.ToString()),
                    CsvCell(row.FarmerName),
                    CsvCell(row.Category),
                    CsvCell(row.Description),
                    CsvNumber(row.Quantity),
                    CsvCell(row.Unit),
                    CsvNumber(row.UnitPrice),
                    CsvNumber(row.Amount),
                    CsvCell(row.OccurredAt.ToString("O"))));
            }

            return CsvFile("deductions-report.csv", csv.ToString());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("farmer/collections")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> MyCollections(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            var farmerId = await _reports.GetFarmerIdForUserAsync(
                CurrentUserId(), ct);

            if (farmerId is null)
                return NotFound(new { message = "Farmer profile not found." });

            return Ok(await _reports.GetCollectionsAsync(
                from, to, farmerId, null, page, pageSize, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("farmer/earnings")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> MyEarnings(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            var farmerId = await _reports.GetFarmerIdForUserAsync(
                CurrentUserId(), ct);

            if (farmerId is null)
                return NotFound(new { message = "Farmer profile not found." });

            return Ok(await _reports.GetEarningsAsync(
                from, to, farmerId, page, pageSize, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("farmer/deductions")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> MyDeductions(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            var farmerId = await _reports.GetFarmerIdForUserAsync(
                CurrentUserId(), ct);

            if (farmerId is null)
                return NotFound(new { message = "Farmer profile not found." });

            return Ok(await _reports.GetDeductionsAsync(
                from, to, farmerId, page, pageSize, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("farmer/loans")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> MyLoans(CancellationToken ct)
    {
        var farmerId = await _reports.GetFarmerIdForUserAsync(
            CurrentUserId(), ct);

        if (farmerId is null)
            return NotFound(new { message = "Farmer profile not found." });

        return Ok(await _reports.GetFarmerLoansAsync(farmerId.Value, ct));
    }

    [HttpGet("collector/collections")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> MyCollectorCollections(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            var collectorId = await _reports.GetCollectorIdForUserAsync(
                CurrentUserId(), ct);

            if (collectorId is null)
                return NotFound(new { message = "Collector profile not found." });

            return Ok(await _reports.GetCollectionsAsync(
                from, to, null, collectorId, page, pageSize, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}