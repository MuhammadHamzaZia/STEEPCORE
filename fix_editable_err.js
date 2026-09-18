import fs from 'fs';
let content = fs.readFileSync('src/components/EditableNode.tsx', 'utf8');

content = content.replace("  }\n  } else if", "  } else if");

fs.writeFileSync('src/components/EditableNode.tsx', content);
