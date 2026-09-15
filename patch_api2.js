import fs from 'fs';

let code = fs.readFileSync('src/services/api.ts', 'utf8');

const oldApi = '`/api/Blueprints/published?page=${page}&pageSize=${pageSize}`';
const newApi = '`/api/Blueprints/published?pageNumber=${page}&pageSize=${pageSize}`';
code = code.replace(oldApi, newApi);

fs.writeFileSync('src/services/api.ts', code);
console.log('patched api');
