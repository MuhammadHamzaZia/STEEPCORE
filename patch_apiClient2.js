import fs from 'fs';

let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

const t1 = `if (response.status === 503) {
        throw new Error('STEEPCOREAPI AI service is currently busy or warming up (503 Service Unavailable). Please try again in a few seconds.');
      }`;

const r1 = `if (response.status === 503) {
        if (msg) throw new Error(msg);
        throw new Error('The AI service is currently busy or warming up (503). Please try again in a few seconds.');
      }`;

content = content.replace(t1, r1);
fs.writeFileSync('src/services/apiClient.ts', content);
