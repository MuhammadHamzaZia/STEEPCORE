import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const t1 = `    } catch (e) {
      console.error("AI Error:", e);
      res.status(500).json({ error: e.message });
    }`;
const r1 = `    } catch (e: any) {
      console.error("AI Error:", e);
      let errMsg = e.message || "Unknown error";
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

const t2 = `    } catch (e) {
      console.error("AI Chat Error:", e);
      res.status(500).json({ error: e.message });
    }`;
const r2 = `    } catch (e: any) {
      console.error("AI Chat Error:", e);
      let errMsg = e.message || "Unknown error";
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = "The AI service is currently experiencing high demand. Please try again in a few moments.";
      }
      res.status(503).json({ error: errMsg });
    }`;

content = content.replace(t1, r1);
content = content.replace(t2, r2);

fs.writeFileSync('server.ts', content);
