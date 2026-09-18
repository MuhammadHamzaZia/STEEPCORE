import fs from 'fs';
let content = fs.readFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', 'utf8');

// Remove conflicting packages
content = content.replace(/<PackageReference Include="Microsoft\.AspNetCore\.OpenApi" Version="[^"]+" \/>/g, '');

// Clean up pruning warnings
content = content.replace(/<PackageReference Include="Microsoft\.Extensions\.Configuration" Version="[^"]+" \/>/g, '');
content = content.replace(/<PackageReference Include="Microsoft\.Extensions\.Configuration\.Json" Version="[^"]+" \/>/g, '');

// Upgrade JWT to fix security warning
content = content.replace(/<PackageReference Include="System\.IdentityModel\.Tokens\.Jwt" Version="7\.0\.3" \/>/g, '<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.0.2" />');
content = content.replace(/<PackageReference Include="Microsoft\.IdentityModel\.Tokens" Version="7\.0\.3" \/>/g, '<PackageReference Include="Microsoft.IdentityModel.Tokens" Version="8.0.2" />');

// Clean up duplicate pgvector?
content = content.replace(/<PackageReference Include="pgvector" Version="0\.2\.1" \/>/g, '');

fs.writeFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', content);
