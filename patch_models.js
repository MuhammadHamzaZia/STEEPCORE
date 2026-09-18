import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/Program.cs', 'utf8');

// Replace all occurrences of Microsoft.OpenApi.Models. with Microsoft.OpenApi.
content = content.replace(/Microsoft\.OpenApi\.Models\./g, 'Microsoft.OpenApi.');

fs.writeFileSync('STEEPCOREAPI/Program.cs', content);
