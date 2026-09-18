import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', 'utf8');

// Force Microsoft.OpenApi to 1.6.14
content = content.replace(/<\/ItemGroup>/, '  <PackageReference Include="Microsoft.OpenApi" Version="1.6.14" />\n  </ItemGroup>');

fs.writeFileSync('STEEPCOREAPI/STEEPCOREAPI.csproj', content);
