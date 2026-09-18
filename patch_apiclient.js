import fs from 'fs';

let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

// Replace standard response.json() with robust version
content = content.replace(
  'const data = await response.json();',
  `let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error("Failed to parse JSON from " + url + " - Server returned HTML or invalid data.");
    }`
);

content = content.replace(
  'return await retryRes.json();',
  `try {
          const text = await retryRes.text();
          return JSON.parse(text);
        } catch (parseError) {
          throw new Error("Failed to parse JSON from " + url + " after retry - Server returned HTML.");
        }`
);

content = content.replace(
  'const data = await res.json();',
  `const text = await res.text();
      const data = JSON.parse(text);`
);

fs.writeFileSync('src/services/apiClient.ts', content);
