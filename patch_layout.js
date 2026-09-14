import fs from 'fs';
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(
  '<Terminal size={20} className="text-fg-default" />',
  '<img src="/logo.svg" alt="Steepcore Logo" className="w-5 h-5 object-contain" />'
);

fs.writeFileSync('src/components/Layout.tsx', code);
