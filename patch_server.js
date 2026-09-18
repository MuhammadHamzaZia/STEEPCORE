const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const retryLogic = `
const withRetry = async (operation: () => Promise<any>, maxRetries = 4, baseDelay = 1500) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (e: any) {
      attempt++;
      const errMsg = e.message || String(e);
      const isRetryable = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429');
      
      if (!isRetryable || attempt >= maxRetries) {
        throw e;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(\`[Retry] AI API returned busy/503, retrying in \${delay}ms... (Attempt \${attempt} of \${maxRetries})\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Maximum retries reached");
};

async function startServer() {
`;

code = code.replace('async function startServer() {', retryLogic);

// Replace generateContent call 1
code = code.replace(
  `const response = await ai.models.generateContent({`,
  `const response = await withRetry(() => ai.models.generateContent({`
);

// We need to add `}))` instead of `});` for both occurrences.
// Actually, let's do this more precisely using regex.
