import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`;
const replace1 = `if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`;

content = content.replace(target1, replace1);
content = content.replace(target1, replace1);

fs.writeFileSync('server.ts', content);
