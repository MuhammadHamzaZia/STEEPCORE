const fs = require('fs');
const fileSchema = '/app/applet/src/types/schema.ts';
let schemaCode = fs.readFileSync(fileSchema, 'utf8');

if (!schemaCode.includes('nodes?: FlowchartNode[]')) {
  schemaCode = schemaCode.replace(
    'nodesCount: number;',
    'nodesCount: number;\n  nodes?: FlowchartNode[];\n  edges?: any[];'
  );
  fs.writeFileSync(fileSchema, schemaCode);
}

const fileApi = '/app/applet/src/services/api.ts';
let apiCode = fs.readFileSync(fileApi, 'utf8');

apiCode = apiCode.replace(
  "return (bp: any) => ({\n  ...bp,\n  id: String(bp.id),\n  nodesCount: bp.nodes?.length || 0,\n  creator: { name: bp.creatorName || bp.creator?.name || 'STEEPCORE', avatar: bp.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }\n})(data);",
  "const formatted = { ...data, id: String(data.id), nodesCount: data.nodes?.length || 0, creator: { name: data.creatorName || data.creator?.name || 'STEEPCORE', avatar: data.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' } };\n        return formatted;"
);

fs.writeFileSync(fileApi, apiCode);
