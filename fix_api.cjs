const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

// Fix GetMyBlueprints
code = code.replace(/fetchApi\('\/api\/blueprints\/me'\)/g, "apiClient.get<Blueprint[]>('/api/blueprints/me')");

// Fix others
code = code.replace(/await fetchApi\('\/api\/Blueprints\/published'\)/g, "await apiClient.get<any[]>('/api/Blueprints/published')");
code = code.replace(/await fetchApi\(`\/api\/Blueprints\/trending\?limit=\\?\${limit}`\)/g, "await apiClient.get<Blueprint[]>(`/api/Blueprints/trending?limit=${limit}`)");
code = code.replace(/await fetchApi\(`\/api\/Blueprints\/search\?query=\\?\${encodeURIComponent\(term\)}`\)/g, "await apiClient.get<Blueprint[]>(`/api/Blueprints/search?query=${encodeURIComponent(term)}`)");
code = code.replace(/await fetchApi\('\/api\/Blueprints\/suggestions'\)/g, "await apiClient.get<string[]>('/api/Blueprints/suggestions')");
code = code.replace(/await fetchApi\('\/api\/Blueprints\/domain-counts'\)/g, "await apiClient.get<Record<string, number>>('/api/Blueprints/domain-counts')");
code = code.replace(/await fetchApi\(`\/api\/Blueprints\/\\?\${id}`\)/g, "await apiClient.get<any>(`/api/Blueprints/${id}`)");
code = code.replace(/await fetchApi\(`\/api\/UserProgress\/\\?\${blueprintId}`\)/g, "await apiClient.get<any[]>(`/api/UserProgress/${blueprintId}`)");
code = code.replace(/await fetchApi\('\/api\/UserProgress\/toggle', \{[^}]*body:\s*JSON\.stringify\(\{([^}]+)\}\)[^}]*\}\)/g, "await apiClient.post('/api/UserProgress/toggle', {$1})");
code = code.replace(/return fetchApi\('\/api\/Ai\/generate', \{ method: 'POST', body: JSON\.stringify\(\{ prompt: params\.prompt \}\) \}\);/g, "return apiClient.post<any>('/api/ai/GenerateRoadmap', { prompt: params.prompt });");
code = code.replace(/return fetchApi\('\/api\/Checkout\/session', \{/g, "return apiClient.post<{ checkoutUrl?: string; sessionId?: string }>('/api/Checkout/session', {");
code = code.replace(/return fetchApi\('\/api\/Checkout\/confirm', \{ paymentId, sessionId \}\);/g, "return apiClient.post('/api/Checkout/confirm', { paymentId, sessionId });");

fs.writeFileSync(file, code);
