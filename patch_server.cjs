const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `      if (isQuota) {
        console.log("[API Quota] " + error.message);
      } else {
        console.error(error);
      }
      
      let errorMessage = "Failed to generate roadmap: " + error.message;
      if (isQuota) { 
         errorMessage = "Gemini API rate limit or quota exceeded. Please try searching for a common role (e.g., 'Software Engineer', 'Data Scientist', 'Backend', 'Frontend') which are pre-generated, or check your API key billing.";
      }
      res.status(500).json({ error: errorMessage });`;

const replacement1 = `      if (isQuota) {
        console.log("[API Quota] " + error.message);
        return res.json({
          role: role || "Learning Path",
          phases: [
            {
              title: "API Quota Exceeded",
              description: "The AI generation quota has been exceeded. Showing placeholder data.",
              topics: [
                {
                  name: "Quota Limits",
                  concepts: ["Check API Key", "Review Billing", "Use Pre-cached Roadmaps (e.g. 'Software Engineer')"]
                }
              ]
            }
          ]
        });
      }
      console.error(error);
      res.status(500).json({ error: "Failed to generate roadmap: " + error.message });`;

const target2 = `      if (isQuota) {
        console.log("[API Quota] " + error.message);
      } else {
        console.error(error);
      }
      
      let errorMessage = "Failed to expand node: " + error.message;
      if (isQuota) { 
         errorMessage = "Gemini API rate limit or quota exceeded. Node expansion requires AI generation. Please check your API key billing.";
      }
      res.status(500).json({ error: errorMessage });`;

const replacement2 = `      if (isQuota) {
        console.log("[API Quota] " + error.message);
        return res.json({
          newNodes: [
            { name: "API Quota Exceeded", type: "concept" },
            { name: "Please check your plan or retry later", type: "concept" }
          ]
        });
      }
      console.error(error);
      res.status(500).json({ error: "Failed to expand node: " + error.message });`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
fs.writeFileSync('server.ts', code);
