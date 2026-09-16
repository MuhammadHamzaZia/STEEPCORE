import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace(/@layer base {\n  html, body, #root {\n    height: 100%;\n    margin: 0;\n    overflow: hidden;\n  }\n}/g, '');

content += `\n
html, body, #root {
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

#root {
  display: flex;
  flex-direction: column;
}
`;

fs.writeFileSync('src/index.css', content);
