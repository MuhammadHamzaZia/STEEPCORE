import fs from 'fs';

let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

const target = "const url = endpoint.startsWith('http') ? endpoint : `${baseUrlSanitized}${endpointSanitized}`;";
const replacement = `
  let url = endpoint.startsWith('http') ? endpoint : \`\${baseUrlSanitized}\${endpointSanitized}\`;
  // Route AI requests to local Express server instead of remote backend
  if (endpoint.toLowerCase().includes('/api/ai/')) {
    url = endpointSanitized;
  }
`;

content = content.replace(target, replacement);
fs.writeFileSync('src/services/apiClient.ts', content);
