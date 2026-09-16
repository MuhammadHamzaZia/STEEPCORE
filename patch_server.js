import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const apiContent = `
  app.use(express.json());

  // API routes FIRST
  app.post("/api/Ai/generate", async (req, res) => {
    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = req.body.prompt;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ["id", "title", "description", "type"]
                }
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["source", "target"]
                }
              }
            },
            required: ["nodes", "edges"]
          },
          systemInstruction: "You are an AI specialized in building highly detailed learning and system architecture roadmaps. Given a topic, generate a comprehensive roadmap containing an array of 'nodes' (steps/topics) and 'edges' (connections). Produce exactly 8-12 nodes for a topic, mapping the learning progression logically.",
        }
      });
      
      if (!response.text) {
        throw new Error("Empty response from AI");
      }
      
      const jsonStr = response.text;
      const data = JSON.parse(jsonStr);
      res.json(data);
    } catch (e) {
      console.error("AI Error:", e);
      res.status(500).json({ error: e.message });
    }
  });
`;

content = content.replace("// Vite middleware for development", apiContent + "\n  // Vite middleware for development");
fs.writeFileSync('server.ts', content);
