const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRetry = `
const withRetry = async (operation: () => Promise<any>, maxRetries = 5, baseDelay = 1500) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (e: any) {
      attempt++;
      const errMsg = String(e.message || e);
      const isQuotaError = errMsg.toLowerCase().includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');
      
      // Only retry if it's a 503/High Demand, NEVER retry a Quota Limit
      const isRetryable = !isQuotaError && (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429'));
      
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
`;

code = code.replace(/const withRetry = async \([\s\S]*?throw new Error\("Maximum retries reached"\);\n\};/, newRetry.trim());

// Fix endpoint 1 catch block
const catchBlockRegex = /if \(errMsg\.includes\('503'\) \|\| errMsg\.includes\('high demand'\) \|\| errMsg\.includes\('UNAVAILABLE'\) \|\| errMsg\.includes\('429'\) \|\| errMsg\.includes\('quota'\)\) \{[\s\S]*?res\.status\(429\)\.json\(\{ error: errMsg \}\);\s+\}/g;

const newCatchBlock = `
      if (errMsg.toLowerCase().includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        errMsg = "You have exhausted your free daily AI generation quota (20 requests/day). Please try again tomorrow or configure a paid API key.";
        console.warn("AI API Quota Exceeded:", errMsg);
        res.status(429).json({ error: errMsg });
      } else if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
        console.warn("AI API limit/busy (503/429):", errMsg);
        res.status(429).json({ error: errMsg });
      }
`;

code = code.replace(catchBlockRegex, newCatchBlock.trim());

fs.writeFileSync('server.ts', code);
