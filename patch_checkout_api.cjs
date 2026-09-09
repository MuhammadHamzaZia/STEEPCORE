const fs = require('fs');
const file = '/app/applet/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /return apiClient\.post<\{ checkoutUrl\?: string; sessionId\?: string \}>\('\/api\/Checkout\/session'/g,
    `return fetchApi('/api/Checkout/session'`
);

code = code.replace(
    /return apiClient\.post\('\/api\/Checkout\/confirm'/g,
    `return fetchApi('/api/Checkout/confirm'`
);

fs.writeFileSync(file, code);
