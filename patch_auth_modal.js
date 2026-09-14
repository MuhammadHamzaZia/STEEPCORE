import fs from 'fs';
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

code = code.replace(
  '<KeyRound size={20} className="text-[#3fb950]" />',
  '<img src="/logo.svg" alt="Steepcore Logo" className="w-5 h-5 object-contain" />'
);

fs.writeFileSync('src/components/AuthModal.tsx', code);
