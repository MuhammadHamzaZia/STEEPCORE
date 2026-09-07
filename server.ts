import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';
import { createClient } from "@libsql/client";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { globalLimiter, apiLimiter } from "./server/middleware/security";
import authRouter from "./server/routes/authRoutes";
import roadmapRouterV2 from "./server/routes/roadmapRoutes";
import jobsRouter from "./server/routes/jobsRoutes";
import searchRouter from "./server/routes/searchRoutes";
import webhookRouter from "./server/routes/webhookRoutes";
import userRoadmapRouter from "./server/routes/userRoadmapRoutes";
import telemetryRouter from "./server/routes/telemetryRoutes";
import paymentRouter from "./server/routes/paymentRoutes";
import { db, initDB } from "./server/config/db";

// --- Database Storage Strategy ---
initDB().catch(console.error);

async function getRoadmapFromDB(id: string) {
  const result = await db.execute({ sql: "SELECT data FROM roadmaps WHERE id = ?", args: [id] });
  return result.rows.length > 0 ? JSON.parse(result.rows[0].data as string) : null;
}

async function saveRoadmapToDB(id: string, data: any) {
  await db.execute({ sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)", args: [id, JSON.stringify(data)] });
}

async function getExpansionFromDB(id: string) {
  const result = await db.execute({ sql: "SELECT data FROM expansions WHERE id = ?", args: [id] });
  return result.rows.length > 0 ? JSON.parse(result.rows[0].data as string) : null;
}

async function saveExpansionToDB(id: string, data: any) {
  await db.execute({ sql: "INSERT OR REPLACE INTO expansions (id, data) VALUES (?, ?)", args: [id, JSON.stringify(data)] });
}

// --- Rate Limiting Helper ---
async function generateWithRetry(ai: any, params: any, maxRetries = 3) {
  let retries = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      if (err.message?.includes("quota") || err.message?.toLowerCase().includes("exceeded your current quota")) {
        throw err; // Don't retry if hard quota exhausted
      }
      if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
        if (retries >= maxRetries) throw err;
        retries++;
        const match = err.message.match(/retry in ([\d\.]+)s/);
        const delayS = match ? parseFloat(match[1]) : Math.pow(2, retries);
        const waitMs = Math.max(delayS * 1000, 2000) + Math.random() * 1000;
        console.warn(`[Rate Limit] Retrying in ${Math.round(waitMs)}ms... (Attempt ${retries}/${maxRetries})`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        throw err;
      }
    }
  }
}

// --- Optimistic Pre-generation Strategy ---
// Asynchronously fetches 'detailed' expansions for the top-level phases so they are ready before the user clicks
async function optimisticallyPreGenerateExpansions(role: string, phases: any[]) {
  if (!process.env.GEMINI_API_KEY) return;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  
  // We will selectively pre-generate tools and projects for the very first topic to save wait times on likely clicks
  if (phases && phases.length > 0 && phases[0].topics && phases[0].topics.length > 0) {
    const firstTopic = phases[0].topics[0].name;
    const cacheKeyTools = `${firstTopic}_topic_tools`;
    
    const existing = await getExpansionFromDB(cacheKeyTools);
    if (!existing) {
      try {
        const promptInstruction = "Please generate a list of essential tools, frameworks, or software required for this node. Return it as 'newNodes' array.";
        const prompt = `The user wants to expand on a specific node in their learning roadmap.\nNode Label: ${firstTopic}\nNode Type: topic\nUser Request: Pre-generated tools\nExpansion Level: tools\n\n${promptInstruction}`;
        
        const response = await generateWithRetry(ai, {
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                newNodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING }
                    },
                    required: ["name", "type"]
                  }
                }
              },
              required: ["newNodes"]
            }
          }
        });
        
        const data = JSON.parse(response.text?.trim() || "{}");
        await saveExpansionToDB(cacheKeyTools, data);
        console.log(`[Optimistic Pre-gen] Successfully cached tools for ${firstTopic}`);
      } catch (err) {
        console.log("[Optimistic Pre-gen] Failed to pre-generate", err);
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy is required for express-rate-limit when running behind a reverse proxy
  app.set("trust proxy", 1);

  // Security & Rate Limiting Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // disabled for dev/vite
  }));
  app.use(globalLimiter);

  // Parse JSON bodies for all routes EXCEPT stripe webhooks
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  app.use(cookieParser());

  // Mount Advanced Router
  app.use("/api/auth", authRouter);
  app.use("/api/roadmaps", roadmapRouterV2);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/webhooks", webhookRouter);
  app.use("/api/user-roadmaps", userRoadmapRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/telemetry", telemetryRouter);

  // Apply API limiter to AI routes
  app.use("/api/roadmap", apiLimiter);
  app.use("/api/chat", apiLimiter);
  app.use("/api/expand-node", apiLimiter);

  // API routes FIRST
  app.post("/api/roadmap", async (req, res) => {
    let role = "";
    try {
      const { timeZone, locale } = req.body;
      role = req.body.role;
      if (!role) {
        res.status(400).json({ error: "Role is required" });
        return;
      }

      // 1. Check Cache
      const cacheKey = role.toLowerCase().trim();
      let existing = await getRoadmapFromDB(cacheKey);
      
      // Try fuzzy search if exact match fails before hitting API
      if (!existing) {
        const fuzzyResult = await db.execute({
          sql: "SELECT id, data FROM roadmaps WHERE id LIKE ? LIMIT 1",
          args: [`%${cacheKey}%`]
        });
        if (fuzzyResult.rows.length > 0) {
          existing = JSON.parse(fuzzyResult.rows[0].data as string);
        }
      }

      if (existing) {
        console.log(`[Cache Hit / Fuzzy Match] Serving roadmap for ${role}`);
        
        // Lightweight LLM customization for region
        try {
          if ((timeZone || locale) && process.env.GEMINI_API_KEY) {
            const ai = new GoogleGenAI({ 
              apiKey: process.env.GEMINI_API_KEY,
              httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
            });
            const prompt = `The user is looking at a learning roadmap for "${role}". Based on their locale (${locale || 'unknown'}) and timezone (${timeZone || 'unknown'}), provide a brief (1-2 sentences) regional market outlook or advice for this career, and 2-3 specific recommended local platforms, job boards, or resources. Return JSON with 'regionalInsight' (string) and 'localResources' (array of strings).`;
            const regionalRes = await generateWithRetry(ai, {
               model: "gemini-3.5-flash",
               contents: prompt,
               config: { 
                 responseMimeType: "application/json",
                 responseSchema: {
                   type: Type.OBJECT,
                   properties: {
                     regionalInsight: { type: Type.STRING },
                     localResources: { type: Type.ARRAY, items: { type: Type.STRING } }
                   }
                 }
               }
            });
            const regionalData = JSON.parse(regionalRes.text?.trim() || "{}");
            existing.regionalInsight = regionalData.regionalInsight;
            existing.localResources = regionalData.localResources;
          }
        } catch (err) {
           console.error("[Regional Customization] Failed:", err);
        }

        // Trigger optimistic pre-gen asynchronously without awaiting
        optimisticallyPreGenerateExpansions(role, existing.phases).catch((e: any) => {
        if (e.message?.includes("quota") || e.message?.includes("429")) {
           console.log("[Background] Pre-generation skipped due to quota limits");
        }
      });
        res.json(existing);
        return;
      }

      console.log(`[Cache Miss] Generating roadmap for ${role}`);

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({ error: "GEMINI_API_KEY is not set" });
        return;
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });


      const prompt = `Use Google Search to find current market trends and future outlooks for the role of "${role}". 
      The user's timezone is ${timeZone || 'unknown'} and locale is ${locale || 'unknown'}. Deduce their country from this information.
      Search the current market requirements and search for recommended courses from the websites of the top 3-5 universities in the user's country related to this field.
      
      Create a comprehensive, up-to-date learning roadmap. Structure it hierarchically:
      1. Main phases/courses.
      2. Sub-courses/topics under each phase.
      3. Key concepts/skills under each sub-course. Include specific top university course recommendations where relevant.
      Return the response as structured JSON.`;

      let response;
      try {
        response = await generateWithRetry(ai, {
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                phases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Phase title" },
                      description: { type: Type.STRING },
                      topics: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING, description: "Topic name" },
                            concepts: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            }
                          },
                          required: ["name", "concepts"]
                        }
                      }
                    },
                    required: ["title", "description", "topics"]
                  }
                }
              },
              required: ["role", "phases"]
            }
          }
        });
      } catch (err: any) {
        console.warn("Google Search tool or main request failed, falling back to standard generation:", err.message);
        response = await generateWithRetry(ai, {
          model: "gemini-3.5-flash",
          contents: prompt + "\n\n(Note: Live search is unavailable. Please provide the best information from your training data.)",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                phases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Phase title" },
                      description: { type: Type.STRING },
                      topics: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING, description: "Topic name" },
                            concepts: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            }
                          },
                          required: ["name", "concepts"]
                        }
                      }
                    },
                    required: ["title", "description", "topics"]
                  }
                }
              },
              required: ["role", "phases"]
            }
          }
        });
      }

      const data = JSON.parse(response.text?.trim() || "{}");
      
      // Save to cache
      await saveRoadmapToDB(cacheKey, data);

      // Trigger optimistic pre-gen asynchronously without awaiting
      optimisticallyPreGenerateExpansions(role, data.phases).catch((e: any) => {
        if (e.message?.includes("quota") || e.message?.includes("429")) {
           console.log("[Background] Pre-generation skipped due to quota limits");
        }
      });

      res.json(data);
    } catch (error: any) {
      const errStr = (error.message || error.toString()).toLowerCase();
      const isQuota = errStr.includes("429") || errStr.includes("resource_exhausted") || errStr.includes("quota");
      if (isQuota) {
        console.log("[API Quota] " + error.message);
        return res.status(429).json({ error: "Gemini API rate limit or quota exceeded. Please try searching for a common role (e.g., 'Software Engineer', 'Data Scientist', 'Backend', 'Frontend') which are pre-generated, or check your API key billing." });
      } else {
        console.error(error);
      }
      
      let errorMessage = "Failed to generate roadmap: " + error.message;
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({ error: "GEMINI_API_KEY is not set" });
        return;
      }
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemInstruction = `You are an expert learning assistant helping a user with their ${context?.role || 'learning'} roadmap. Use the context provided to answer their questions. Keep your answers concise, practical, and encouraging.`;

      const formattedMessages = messages.map((m: any) => ({
         role: m.role === 'user' ? 'user' : 'model',
         parts: [{ text: m.content }]
      }));

      const response = await generateWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: formattedMessages,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      const errStr = (error.message || error.toString()).toLowerCase();
      const isQuota = errStr.includes("429") || errStr.includes("resource_exhausted") || errStr.includes("quota");
      
      if (isQuota) {
        console.log("[API Quota] " + error.message);
        return res.json({ text: "I'm currently unavailable due to API rate limits. Please try again later or check your billing plan." });
      }
      
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expand-node", async (req, res) => {
    try {
      const { nodeLabel, nodeType, promptContext, expansionType } = req.body;
      
      // 1. Check Cache
      const expCacheKey = `${nodeLabel}_${nodeType}_${expansionType}`;
      const existing = await getExpansionFromDB(expCacheKey);
      if (existing) {
        console.log(`[Cache Hit] Serving expansion for ${expCacheKey}`);
        res.json(existing);
        return;
      }
      
      console.log(`[Cache Miss] Generating expansion for ${expCacheKey}`);

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({ error: "GEMINI_API_KEY is not set" });
        return;
      }
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      let schema;
      let promptInstruction = "";

      if (expansionType === 'detailed') {
        promptInstruction = "Please generate a detailed hierarchical structure (phases -> topics -> concepts/courses) branching from this node, based on the user's request. Return it as 'phases' array.";
        schema = {
          type: Type.OBJECT,
          properties: {
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Phase title" },
                  description: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "Topic name" },
                        concepts: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      },
                      required: ["name", "concepts"]
                    }
                  }
                },
                required: ["title", "description", "topics"]
              }
            }
          },
          required: ["phases"]
        };
      } else {
        if (expansionType === 'tools') {
          promptInstruction = "Please generate a list of essential tools, frameworks, or software required for this node. Return it as 'newNodes' array.";
        } else if (expansionType === 'projects') {
          promptInstruction = "Please generate a list of practical project ideas to master the skills in this node. Return it as 'newNodes' array.";
        } else if (expansionType === 'resources') {
          promptInstruction = "Please generate a list of recommended learning resources (books, courses, docs) for this node. Return it as 'newNodes' array.";
        } else if (expansionType === 'interview') {
          promptInstruction = "Please generate a list of common interview questions or topics related to this node. Return it as 'newNodes' array.";
        } else {
          promptInstruction = "Please generate a flat list of sub-topics or concepts for this specific node, based on the user's request. Return it as 'newNodes' array.";
        }

        schema = {
          type: Type.OBJECT,
          properties: {
            newNodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the new sub-topic or concept" },
                  type: { type: Type.STRING, description: "Must be either 'topic' or 'concept'" }
                },
                required: ["name", "type"]
              }
            }
          },
          required: ["newNodes"]
        };
      }

      const prompt = `The user wants to expand on a specific node in their learning roadmap.
      Node Label: ${nodeLabel}
      Node Type: ${nodeType}
      User Request: ${promptContext}
      Expansion Level: ${expansionType}

      ${promptInstruction}`;

      const response = await generateWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      
      // Save to cache
      await saveExpansionToDB(expCacheKey, data);

      res.json(data);
    } catch (error: any) {
      const errStr = (error.message || error.toString()).toLowerCase();
      const isQuota = errStr.includes("429") || errStr.includes("resource_exhausted") || errStr.includes("quota");
      if (isQuota) {
        console.log("[API Quota] " + error.message);
        return res.status(429).json({ error: "Gemini API rate limit or quota exceeded. Node expansion requires AI generation. Please check your API key billing." });
      } else {
        console.error(error);
      }
      
      let errorMessage = "Failed to expand node: " + error.message;
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
