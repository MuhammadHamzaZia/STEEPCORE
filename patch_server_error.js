import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex1 = /} catch \\(e\\) {\\s+console\\.error\\("AI Error:", e\\);\\s+res\\.status\\(500\\)\\.json\\({ error: e\\.message }\\);\\s+}/;
const replace1 = `} catch (e: any) {
      console.error("AI Error:", e);
      let errMsg = e.message;
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

content = content.replace(regex1, replace1);

const regex2 = /} catch \\(e\\) {\\s+console\\.error\\("AI Chat Error:", e\\);\\s+res\\.status\\(500\\)\\.json\\({ error: e\\.message }\\);\\s+}/;
const replace2 = `} catch (e: any) {
      console.error("AI Chat Error:", e);
      let errMsg = e.message;
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

content = content.replace(regex2, replace2);
fs.writeFileSync('server.ts', content);
