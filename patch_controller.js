import fs from 'fs';

let content = fs.readFileSync('./STEEPCOREAPI/Modules/Marketplace/Controllers/AccessRequestsController.cs', 'utf8');

content = content.replace(
  'public class AccessRequestDto\n{\n    public Guid BlueprintId { get; set; }\n}',
  'public class AccessRequestDto\n{\n    public Guid BlueprintId { get; set; }\n    public string? CreatorId { get; set; }\n}'
);

content = content.replace(
  'var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;\n        \n        _logger.LogInformation($"User {userId} requested access to blueprint {request.BlueprintId}");',
  'var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;\n        \n        _logger.LogInformation($"User {userId} requested access to blueprint {request.BlueprintId} from creator {request.CreatorId}");'
);

fs.writeFileSync('./STEEPCOREAPI/Modules/Marketplace/Controllers/AccessRequestsController.cs', content);
