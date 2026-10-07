using Microsoft.AspNetCore.Mvc;

namespace TeaLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            service = "TeaLedger API",
            timestamp = DateTime.UtcNow
        });
    }
}