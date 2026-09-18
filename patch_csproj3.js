import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', 'utf8');

// Remove the forced 1.6.14 line
content = content.replace(/<PackageReference Include="Microsoft\.OpenApi" Version="1\.6\.14" \/>\n/g, '');

fs.writeFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', content);
