const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('getMyBlueprints:')) {
    const target = 'export const api = {';
    const replacement = `export const api = {
  getMyBlueprints: async (): Promise<Blueprint[]> => {
    return fetchApi('/api/blueprints/me');
  },`;
    code = code.replace(target, replacement);
    fs.writeFileSync(file, code);
    console.log("api.ts updated");
}
