import fs from 'fs';
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

code = code.replace(
  /setQuickSuggestions\(suggestions\);/,
  `if (suggestions && suggestions.length > 0) {
          const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
          setQuickSuggestions(shuffled.slice(0, 15));
        } else {
          setQuickSuggestions([]);
        }`
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log('Patched LandingPage suggestions');
