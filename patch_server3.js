import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const t1 = `    } catch (e: any) {
      console.error("AI Error:", e);
      let errMsg = e.message || "Unknown error";
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

const r1 = `    } catch (e: any) {
      console.error("AI Error:", e);
      let errMsg = e.message || "Unknown error";
      
      try {
        if (errMsg.includes('{')) {
           const jsonPart = errMsg.substring(errMsg.indexOf('{'));
           const parsed = JSON.parse(jsonPart);
           if (parsed.error && parsed.error.message) {
             errMsg = parsed.error.message;
           }
        }
      } catch(err) {}
      
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

const t2 = `    } catch (e: any) {
      console.error("AI Chat Error:", e);
      let errMsg = e.message || "Unknown error";
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

const r2 = `    } catch (e: any) {
      console.error("AI Chat Error:", e);
      let errMsg = e.message || "Unknown error";
      
      try {
        if (errMsg.includes('{')) {
           const jsonPart = errMsg.substring(errMsg.indexOf('{'));
           const parsed = JSON.parse(jsonPart);
           if (parsed.error && parsed.error.message) {
             errMsg = parsed.error.message;
           }
        }
      } catch(err) {}
      
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

content = content.replace(t1, r1);
content = content.replace(t2, r2);

fs.writeFileSync('server.ts', content);
