using Microsoft.AspNetCore.Mvc;

namespace STEEPCOREAPI.Modules.Telemetry.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TelemetryController : ControllerBase
{
    private readonly ILogger<TelemetryController> _logger;

    public TelemetryController(ILogger<TelemetryController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    public ActionResult LogEvent([FromBody] TelemetryEvent evt)
    {
        _logger.LogInformation("Telemetry: {EventName} - Data: {EventData}", evt.EventName, evt.Data);
        return Ok(new { success = true });
    }
}

public class TelemetryEvent
{
    public string EventName { get; set; } = "";
    public object? Data { get; set; }
}
