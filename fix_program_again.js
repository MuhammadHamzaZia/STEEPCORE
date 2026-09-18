import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/Program.cs', 'utf8');

// The file currently has a corruption at: `});ng Microsoft.AspNetCore.Authentication.JwtBearer;`
// Let's replace the corrupted part with the correct content.
// Basically, we want to cut out the bad part from AddSwaggerGen to the NEXT // UPDATED CORS POLICY.

const beforeSwagger = content.substring(0, content.indexOf('builder.Services.AddSwaggerGen(c =>'));
const afterCors = content.substring(content.indexOf('// UPDATED CORS POLICY:'));

const fixedSwagger = `builder.Services.AddSwaggerGen(c =>
{
    // Swagger auth configuration temporarily disabled for .NET 10 / OpenAPI v2 compatibility
});

`;

fs.writeFileSync('STEEPCOREAPI/Program.cs', beforeSwagger + fixedSwagger + afterCors);
