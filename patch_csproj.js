import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', 'utf8');

// Remove the explicit Microsoft.OpenApi reference
content = content.replace(/<PackageReference Include="Microsoft.OpenApi" Version="2.7.5" \/>\s*/g, '');

fs.writeFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', content);
