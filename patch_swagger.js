import fs from 'fs';
let content = fs.readFileSync('STEEPCOREAPI/Program.cs', 'utf8');

// Replace the entire AddSwaggerGen block
const startIdx = content.indexOf('builder.Services.AddSwaggerGen(c =>');
const endIdx = content.indexOf('});\n\n// UPDATED CORS POLICY');

const newSwaggerGen = `builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme.\\r\\n\\r\\n Enter 'Bearer' [space] and then your token in the text input below.\\r\\n\\r\\nExample: \\"Bearer 1safsfsdfdfd\\""
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
`;

content = content.substring(0, startIdx) + newSwaggerGen + content.substring(endIdx);
fs.writeFileSync('STEEPCOREAPI/Program.cs', content);
