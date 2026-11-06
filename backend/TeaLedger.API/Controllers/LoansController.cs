using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeaLedger.API.Authorization;
using TeaLedger.API.DTOs.Loans;
using TeaLedger.API.Interfaces;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/loans")]
[Authorize]
public sealed class LoansController : ControllerBase
{
    private readonly ILoanService _loanService;

    public LoansController(ILoanService loanService)
    {
        _loanService = loanService;
    }

    private Guid CurrentUserId()
    {
        var value = User.FindFirst(
            JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid JWT subject claim.");
        }

        return userId;
    }

    // POST api/loans/farmers/{farmerId}
    // Collector issues a loan to one of their own farmers.
    [HttpPost("farmers/{farmerId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> CreateLoan(
        Guid farmerId,
        [FromBody] CreateLoanDto input,
        CancellationToken ct)
    {
        try
        {
            var result = await _loanService.CreateLoanAsync(
                CurrentUserId(),
                farmerId,
                input,
                ct);

            return CreatedAtAction(
                nameof(GetCollectorLoan),
                new { loanId = result.Id },
                result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // POST api/loans/{loanId}/repayments
    [HttpPost("{loanId:guid}/repayments")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> RecordRepayment(
        Guid loanId,
        [FromBody] CreateLoanRepaymentDto input,
        CancellationToken ct)
    {
        try
        {
            var result = await _loanService.RecordRepaymentAsync(
                CurrentUserId(),
                loanId,
                input,
                ct);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET api/loans/collector?farmerId={farmerId}
    [HttpGet("collector")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> CollectorLoans(
        [FromQuery] Guid? farmerId,
        CancellationToken ct)
    {
        try
        {
            var result = await _loanService.GetCollectorLoansAsync(
                CurrentUserId(),
                farmerId,
                ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET api/loans/collector/{loanId}
    [HttpGet("collector/{loanId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CollectorOnly)]
    public async Task<IActionResult> GetCollectorLoan(
        Guid loanId,
        CancellationToken ct)
    {
        try
        {
            var result = await _loanService.GetCollectorLoanAsync(
                CurrentUserId(),
                loanId,
                ct);

            return result is null ? NotFound() : Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET api/loans/farmer
    [HttpGet("farmer")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> FarmerLoans(
        CancellationToken ct)
    {
        try
        {
            var result = await _loanService.GetFarmerLoansAsync(
                CurrentUserId(),
                ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET api/loans/farmer/{loanId}
    [HttpGet("farmer/{loanId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.FarmerOnly)]
    public async Task<IActionResult> GetFarmerLoan(
        Guid loanId,
        CancellationToken ct)
    {
        try
        {
            var result = await _loanService.GetFarmerLoanAsync(
                CurrentUserId(),
                loanId,
                ct);

            return result is null ? NotFound() : Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET api/loans/admin?farmerId=...&collectorId=...
    [HttpGet("admin")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> AdminLoans(
        [FromQuery] Guid? farmerId,
        [FromQuery] Guid? collectorId,
        CancellationToken ct)
    {
        var result = await _loanService.GetAdminLoansAsync(
            farmerId,
            collectorId,
            ct);

        return Ok(result);
    }
}