import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const apiContent = `
  app.post("/api/ai/Chat", async (req, res) => {
    try {
      const { GoogleGenAI, Type, FunctionDeclaration } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { messages, context } = req.body;
      
      const systemInstruction = \`You are an interactive AI assistant for a learning roadmap application. 
You can help users learn topics, explain concepts, and modify their active learning roadmap.
Current Topic: \${context.role || 'Unknown'}
Current Nodes in Roadmap: \${JSON.stringify(context.nodes?.map((n:any)=>({id: n.id, title: n.data.label, description: n.data.description})) || [])}
You have the ability to call tools to modify the roadmap. If the user asks to add a node, update a node, or delete a node, use the appropriate tool. 
Make sure your text response is friendly, helpful, and concise.\`;

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
    } catch (e) {
      console.error("AI Chat Error:", e);
      res.status(500).json({ error: e.message });
    }
  });
`;

content = content.replace('// Vite middleware for development', apiContent + '\n  // Vite middleware for development');
fs.writeFileSync('server.ts', content);
