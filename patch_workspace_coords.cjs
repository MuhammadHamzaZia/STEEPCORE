const fs = require('fs');
const file = '/app/applet/src/components/RoadmapWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCheck = `position: n.coordinates || (n.positionX !== undefined && n.positionY !== undefined && (n.positionX !== 0 || n.positionY !== 0) ? { x: n.positionX, y: n.positionY } : { x: (idx % 3) * 240 + 50, y: Math.floor(idx / 3) * 160 + 50 }),`;
const newCheck = `position: (typeof n.positionX === 'number' && typeof n.positionY === 'number') ? { x: n.positionX, y: n.positionY } : (n.coordinates || { x: (idx % 3) * 240 + 50, y: Math.floor(idx / 3) * 160 + 50 }),`;

code = code.replace(oldCheck, newCheck);

// Also in loadBlueprint:
// position: { x: n.positionX || Math.random() * 500, y: n.positionY || Math.random() * 500 },
const oldLoadCheck = `position: { x: n.positionX || Math.random() * 500, y: n.positionY || Math.random() * 500 },`;
const newLoadCheck = `position: { x: typeof n.positionX === 'number' ? n.positionX : Math.random() * 500, y: typeof n.positionY === 'number' ? n.positionY : Math.random() * 500 },`;
code = code.replace(oldLoadCheck, newLoadCheck);

fs.writeFileSync(file, code);
