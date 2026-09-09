const fs = require('fs');
const file = '/app/applet/src/main.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('ErrorBoundary')) {
  code = "import { ErrorBoundary } from './ErrorBoundary';\n" + code;
  code = code.replace("<App />", "<ErrorBoundary><App /></ErrorBoundary>");
  fs.writeFileSync(file, code);
}
