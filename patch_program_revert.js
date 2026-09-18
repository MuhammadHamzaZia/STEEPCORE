import fs from 'fs';
let content = fs.readFileSync('STEEPCOREAPI/Program.cs', 'utf8');

// Put Models back!
content = content.replace(/Microsoft\.OpenApi\.OpenApiSecurityScheme/g, 'Microsoft.OpenApi.Models.OpenApiSecurityScheme');
content = content.replace(/Microsoft\.OpenApi\.SecuritySchemeType/g, 'Microsoft.OpenApi.Models.SecuritySchemeType');
content = content.replace(/Microsoft\.OpenApi\.ParameterLocation/g, 'Microsoft.OpenApi.Models.ParameterLocation');
content = content.replace(/Microsoft\.OpenApi\.OpenApiSecurityRequirement/g, 'Microsoft.OpenApi.Models.OpenApiSecurityRequirement');
content = content.replace(/Microsoft\.OpenApi\.OpenApiReference/g, 'Microsoft.OpenApi.Models.OpenApiReference');
content = content.replace(/Microsoft\.OpenApi\.ReferenceType/g, 'Microsoft.OpenApi.Models.ReferenceType');

fs.writeFileSync('STEEPCOREAPI/Program.cs', content);
