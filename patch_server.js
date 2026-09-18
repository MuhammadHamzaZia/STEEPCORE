import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const targetInstruction = `If the user asks to add a node, update a node, or delete a node, use the appropriate tool.`;
const newInstruction = `If the user asks to add a node, update a node, or delete a node, use the appropriate tool. If the user asks to add a whole new roadmap, list of topics, or multiple connected nodes, use the add_multiple_nodes tool to generate them all at once.`;
content = content.replace(targetInstruction, newInstruction);

const targetAddNode = `      const tool_addNode = {`;
const newMultipleNodesTool = `      const tool_addMultipleNodes = {
        name: "add_multiple_nodes",
        description: "Add a complete roadmap or multiple new connected nodes to the workspace at once. Use this when the user asks to add a new roadmap or multiple topics.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique temporary ID for this node" },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                  sourceNodeId: { type: Type.STRING, description: "ID of the parent node to connect from. Can be an existing node ID or one of the temporary IDs defined in this array." }
                },
                required: ["id", "title", "description", "type"]
              }
            }
          },
          required: ["nodes"]
        }
      };

      const tool_addNode = {`;
content = content.replace(targetAddNode, newMultipleNodesTool);

const targetDeclarations = `tools: [{ functionDeclarations: [tool_addNode, tool_updateNode, tool_deleteNode] }],`;
const newDeclarations = `tools: [{ functionDeclarations: [tool_addNode, tool_addMultipleNodes, tool_updateNode, tool_deleteNode] }],`;
content = content.replace(targetDeclarations, newDeclarations);

const targetActionsLoop = `      for (const call of functionCalls) {
        if (call.name === 'add_node') {`;
const newActionsLoop = `      for (const call of functionCalls) {
        if (call.name === 'add_node') {
          actions.push({ type: 'ADD_NODE', node: call.args, sourceNodeId: call.args.sourceNodeId });
        } else if (call.name === 'add_multiple_nodes') {
          actions.push({ type: 'ADD_MULTIPLE_NODES', nodes: call.args.nodes });
        } else if (call.name === 'update_node' || call.name === 'add_node') { // ignore duplicate`;
content = content.replace(`        if (call.name === 'add_node') {\n          actions.push({ type: 'ADD_NODE', node: call.args, sourceNodeId: call.args.sourceNodeId });`, `        if (call.name === 'add_node') {\n          actions.push({ type: 'ADD_NODE', node: call.args, sourceNodeId: call.args.sourceNodeId });\n        } else if (call.name === 'add_multiple_nodes') {\n          actions.push({ type: 'ADD_MULTIPLE_NODES', nodes: call.args.nodes });`);

fs.writeFileSync('server.ts', content);
console.log("Server patched successfully");
