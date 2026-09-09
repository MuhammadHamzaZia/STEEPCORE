const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Modules/AiEngine/Services/GeminiAiService.cs';
let code = fs.readFileSync(file, 'utf8');

// 1. Change model to gemini-1.5-pro for deep research
code = code.replace(
    /gemini-3\.6-flash:generateContent/g,
    'gemini-1.5-pro:generateContent'
);

// 2. Change prompt
const oldPromptMatch = /private const string SystemPrompt = @"You are an expert learning roadmap generator[\s\S]*?comprehensive roadmap.";/;
const newPrompt = `private const string SystemPrompt = @"You are an expert curriculum designer and senior industry architect. 
Generate a HIGHLY DETAILED, EXHAUSTIVE, AND DEEPLY RESEARCHED learning roadmap for the user's goal.
The roadmap MUST be long, comprehensive, and contain at least 25 to 40 interconnected nodes. 
Organize the learning path into distinct, progressive phases (e.g., Absolute Basics, Core Foundations, Intermediate Concepts, Advanced Architecture, Tools & Ecosystem, and Real-World Expert Projects).
Each node must represent a crucial, highly researched topic, not just generic filler.

Return ONLY valid JSON (no markdown, no explanations) matching this exact structure:
{
  ""title"": ""string (An engaging, professional title)"",
  ""description"": ""string (A deep, professional overview of the learning path)"",
  ""domain"": ""string (e.g., Software Engineering, Data Science, etc.)"",
  ""price"": 49.99,
  ""nodes"": [
    {
      ""id"": ""node-1"",
      ""label"": ""string (Specific, highly researched topic)"",
      ""type"": ""default"",
      ""positionX"": 0,
      ""positionY"": 0,
      ""isExpandable"": false
    }
  ],
  ""edges"": [
    {
      ""id"": ""edge-1"",
      ""source"": ""node-1"",
      ""target"": ""node-2"",
      ""label"": ""optional string (e.g., 'prerequisite', 'next step')""
    }
  ]
}

Rules:
1. Generate at least 25 to 40 nodes. DO NOT generate short 5-node roadmaps.
2. Every node must have a unique ID. Edges must reference valid node IDs.
3. If a node represents a broad, complex topic that should be broken down into a separate nested sub-roadmap later, set ""isExpandable"": true.
4. Arrange nodes in a logical sequential flowchart. 
5. Assign realistic 'positionX' and 'positionY' coordinates. Lay them out hierarchically (e.g., Y increases by 150 for each step down, X spreads horizontally for branches).
6. Provide rich, highly specific labels (e.g., 'B-Tree Indexing in PostgreSQL' instead of just 'Databases').";`;

code = code.replace(oldPromptMatch, newPrompt);

// 3. Increase max tokens to allow for long generation
code = code.replace(/MaxOutputTokens = 4096/g, 'MaxOutputTokens = 8192');

fs.writeFileSync(file, code);
