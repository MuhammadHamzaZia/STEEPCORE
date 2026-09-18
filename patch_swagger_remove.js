import fs from 'fs';
let content = fs.readFileSync('STEEPCOREAPI/Program.cs', 'utf8');

// Replace the entire AddSwaggerGen block to just be basic
const startIdx = content.indexOf('builder.Services.AddSwaggerGen(c =>');
const endIdx = content.indexOf('});\n// UPDATED CORS POLICY');

const newSwaggerGen = `builder.Services.AddSwaggerGen(c =>
{
    // Swagger auth configuration temporarily disabled for .NET 10 / OpenAPI v2 compatibility
});\n`;

content = content.substring(0, startIdx) + newSwaggerGen + content.substring(endIdx + 4);
fs.writeFileSync('STEEPCOREAPI/Program.cs', content);
