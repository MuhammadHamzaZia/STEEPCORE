import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });',
  'const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });' // keep the first one since we already replaced it
);

content = content.replace(
  'const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });',
  `if (!process.env.GEMINI_API_KEY) { throw new Error("GEMINI_API_KEY environment variable is required."); }\n      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`
);

// We should just ensure it's required. Let's do a simpler regex if it's there twice.
