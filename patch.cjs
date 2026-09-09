const fs = require('fs');
const file = '/app/applet/src/store/useAuthStore.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `      register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          await apiClient.post('/api/Auth/register', {
            username,
            fullName: username,
            email,
            password,
          });`;

code = code.replace(/register: async \(username, fullName: username, email, password\) => \{[\s\S]*?password,\s*\}\);/g, replacement);

fs.writeFileSync(file, code);
console.log("Patched!");
