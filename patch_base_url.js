import fs from 'fs';

let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

// Ensure BASE_URL is the remote API unless explicitly pointing to another valid remote API
content = content.replace(
  "const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://steepcoreapi.onrender.com';",
  `let envBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL;
if (envBaseUrl && (envBaseUrl === '/' || envBaseUrl.includes('run.app') || envBaseUrl.includes('localhost'))) {
  envBaseUrl = null; // Ignore self-referential or local URLs for the backend API
}
const BASE_URL = envBaseUrl || 'https://steepcoreapi.onrender.com';`
);

fs.writeFileSync('src/services/apiClient.ts', content);
