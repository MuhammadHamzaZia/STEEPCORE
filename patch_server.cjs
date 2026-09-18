const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const retryLogic = `
const withRetry = async (operation: () => Promise<any>, maxRetries = 5, baseDelay = 1500) => {
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
      console.warn(\`[Retry] AI API returned busy/503/429, retrying in \${delay}ms... (Attempt \${attempt} of \${maxRetries})\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Maximum retries reached");
};

async function startServer() {
`;

code = code.replace('async function startServer() {', retryLogic);

// Call 1
code = code.replace(
  `const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,`,
  `const response = await withRetry(() => ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,`
);

code = code.replace(
  `          systemInstruction: "You are an AI specialized in building highly detailed learning and system architecture roadmaps. Given a topic, generate a comprehensive roadmap containing an array of 'nodes' (steps/topics) and 'edges' (connections). Produce exactly 8-12 nodes for a topic, mapping the learning progression logically.",
        }
      });`,
  `          systemInstruction: "You are an AI specialized in building highly detailed learning and system architecture roadmaps. Given a topic, generate a comprehensive roadmap containing an array of 'nodes' (steps/topics) and 'edges' (connections). Produce exactly 8-12 nodes for a topic, mapping the learning progression logically.",
        }
      }));`
);

// Call 2
code = code.replace(
  `const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedMessages,`,
  `const response = await withRetry(() => ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedMessages,`
);

code = code.replace(
  `        tools: [{ functionDeclarations: [tool_addNode, tool_addMultipleNodes, tool_updateNode, tool_deleteNode] }],
        config: { systemInstruction }
      });`,
  `        tools: [{ functionDeclarations: [tool_addNode, tool_addMultipleNodes, tool_updateNode, tool_deleteNode] }],
        config: { systemInstruction }
      }));`
);


fs.writeFileSync('server.ts', code);
