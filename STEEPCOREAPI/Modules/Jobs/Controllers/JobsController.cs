using Microsoft.AspNetCore.Mvc;

namespace STEEPCOREAPI.Modules.Jobs.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class JobsController : ControllerBase
{
    // A simple mock for now that replaces the dummy data in the Node server
    [HttpGet]
    public ActionResult GetJobs([FromQuery] string query, [FromQuery] string location)
    {
        var dummyJobs = new[] {
            new {
                id = Guid.NewGuid().ToString(),
                title = "Senior Cloud Architect",
                company = "TechNova",
                location = "Remote",
                type = "Full-time",
                salary = "$150k - $200k",
                description = "Looking for an experienced cloud architect to lead our Azure migration."
            },
            new {
                id = Guid.NewGuid().ToString(),
                title = "Backend .NET Engineer",
                company = "FinTrust",
                location = "New York, NY",
                type = "Contract",
                salary = "$120/hr",
                description = "Build high-throughput microservices using C# and PostgreSQL."
            }
        };
        
        return Ok(dummyJobs);
    }
}
