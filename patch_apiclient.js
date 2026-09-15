import fs from 'fs';

let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

code = code.replace(
  /\} catch \(err: any\) \{/g,
  `} catch (err: any) {
    if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('rate limit'))) {
       throw new Error('The AI free generation quota has been exceeded. Please try again later.');
    }`
);

fs.writeFileSync('src/services/apiClient.ts', code);
console.log('patched apiClient error handling');
