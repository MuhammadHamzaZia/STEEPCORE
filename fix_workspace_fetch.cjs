const fs = require('fs');
const file = '/app/applet/src/components/RoadmapWorkspace.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { apiClient } from '../services/apiClient';")) {
    code = code.replace("import { api } from '../services/api';", "import { api } from '../services/api';\nimport { apiClient } from '../services/apiClient';");
}

const chatFetch = `const response = await fetch('/api/ai/Chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('auth_token') || ''}\`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
          context: { role: initialRole }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();`;

const chatNew = `const data = await apiClient.post<any>('/api/ai/Chat', {
          messages: [{ role: 'user', content: input }],
          context: { role: initialRole }
      });`;
code = code.replace(chatFetch, chatNew);

const expandFetch = `const response = await fetch('/api/ai/ExpandNode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          promptContext: prompt,
          expansionType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate expansion');
      }

      const data = await response.json();`;

const expandNew = `const data = await apiClient.post<any>('/api/ai/ExpandNode', {
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          promptContext: prompt,
          expansionType
      });`;
code = code.replace(expandFetch, expandNew);

const saveFetch = `const response = await fetch('/api/blueprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('auth_token') || ''}\`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('You must be logged in to save a roadmap to your profile.');
        } else {
          alert('Failed to save roadmap.');
        }
        return;
      }`;
const saveNew = `
      try {
        await apiClient.post('/api/blueprints', payload);
      } catch (err: any) {
        if (err.message?.includes('401')) {
          alert('You must be logged in to save a roadmap to your profile.');
        } else {
          alert('Failed to save roadmap.');
        }
        return;
      }`;
code = code.replace(saveFetch, saveNew);

fs.writeFileSync(file, code);
