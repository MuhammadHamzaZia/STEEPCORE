import fs from 'fs';
let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

const target = `    let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("HTML/Invalid data received:", text.substring(0, 500));
      throw new Error("Failed to parse JSON from " + url + " - Server returned HTML or invalid data.");
    }`;

const replacement = `    let data;
    const text = await response.text();
    
    // Check if the response is actually HTML despite being 2xx
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
        throw new Error("Server returned an HTML page instead of JSON. The service might be restarting or unavailable.");
    }
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("HTML/Invalid data received:", text.substring(0, 500));
      throw new Error("Failed to parse JSON from " + url + " - Server returned HTML or invalid data.");
    }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/services/apiClient.ts', content);
