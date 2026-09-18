import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  
  app.use(express.json());

  // API routes FIRST
  app.post("/api/Ai/generate", async (req, res) => {
    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }
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
    } catch (e: any) {
      let errMsg = e.message || "Unknown error";
      
      try {
        if (errMsg.includes('{')) {
           const jsonPart = errMsg.substring(errMsg.indexOf('{'));
           const parsed = JSON.parse(jsonPart);
           if (parsed.error && parsed.error.message) {
             errMsg = parsed.error.message;
           }
        }
      } catch(err) {}
      
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429') || errMsg.includes('quota')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
        console.warn("AI API limit/busy (503/429):", errMsg);
        res.status(503).json({ error: errMsg });
      } else {
        console.error("AI Error:", e);
        res.status(500).json({ error: errMsg });
      }
    }
  });

  
  app.post("/api/ai/Chat", async (req, res) => {
    try {
      const { GoogleGenAI, Type, FunctionDeclaration } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { messages, context } = req.body;
      
      const systemInstruction = `You are an interactive AI assistant for a learning roadmap application. 
You can help users learn topics, explain concepts, and modify their active learning roadmap.
Current Topic: ${context.role || 'Unknown'}
Current Nodes in Roadmap: ${JSON.stringify(context.nodes?.map((n:any)=>({id: n.id, title: n.data.label, description: n.data.description})) || [])}
You have the ability to call tools to modify the roadmap. If the user asks to add a node, update a node, or delete a node, use the appropriate tool. 
Make sure your text response is friendly, helpful, and concise.`;

      const tool_addNode = {
        name: "add_node",
        description: "Add a new node to the roadmap",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            sourceNodeId: { type: Type.STRING, description: "Optional ID of the parent node to connect from" }
          },
          required: ["title", "description", "type"]
        }
      };

      const tool_updateNode = {
        name: "update_node",
        description: "Update an existing node's title or description",
        parameters: {
          type: Type.OBJECT,
          properties: {
            nodeId: { type: Type.STRING, description: "ID of the node or exact title" },
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["nodeId"]
        }
      };

      const tool_deleteNode = {
        name: "delete_node",
        description: "Delete a node from the roadmap",
        parameters: {
          type: Type.OBJECT,
          properties: {
            nodeId: { type: Type.STRING, description: "ID of the node or exact title" }
          },
          required: ["nodeId"]
        }
      };

      const formattedMessages = messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: formattedMessages,
        tools: [{ functionDeclarations: [tool_addNode, tool_updateNode, tool_deleteNode] }],
        config: { systemInstruction }
      });

      const functionCalls = response.functionCalls || [];
      const text = response.text || "Sure, I've updated the roadmap for you.";
      
      const actions: any[] = [];
      for (const call of functionCalls) {
        if (call.name === 'add_node') {
          actions.push({ type: 'ADD_NODE', node: call.args, sourceNodeId: call.args.sourceNodeId });
        } else if (call.name === 'update_node') {
          actions.push({ type: 'UPDATE_NODE', nodeId: call.args.nodeId, updates: { label: call.args.title, description: call.args.description } });
        } else if (call.name === 'delete_node') {
          actions.push({ type: 'DELETE_NODE', nodeId: call.args.nodeId });
        }
      }

      res.json({ text, actions });
    } catch (e: any) {
      let errMsg = e.message || "Unknown error";
      
      try {
        if (errMsg.includes('{')) {
           const jsonPart = errMsg.substring(errMsg.indexOf('{'));
           const parsed = JSON.parse(jsonPart);
           if (parsed.error && parsed.error.message) {
             errMsg = parsed.error.message;
           }
        }
      } catch(err) {}
      
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429') || errMsg.includes('quota')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
        console.warn("AI Chat API limit/busy (503/429):", errMsg);
        res.status(503).json({ error: errMsg });
      } else {
        console.error("AI Chat Error:", e);
        res.status(500).json({ error: errMsg });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
