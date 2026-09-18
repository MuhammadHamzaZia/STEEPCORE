import fs from 'fs';
let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

content = content.replace(
  `      throw new Error("Failed to parse JSON from " + url + " - Server returned HTML or invalid data.");`,
  `      console.error("HTML/Invalid data received:", text.substring(0, 500));
      throw new Error("Failed to parse JSON from " + url + " - Server returned HTML or invalid data.");`
);

fs.writeFileSync('src/services/apiClient.ts', content);
