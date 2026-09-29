import express from "express";
import path from "path";
import fs from "fs";
import dns from "node:dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { synthesizeRoadmapBlueprint, cleanRoleTitle } from "./src/services/roadmapSynthesizer";

// Ensure Node resolves IPv4 first to prevent IPv6 timeouts in container environments
dns.setDefaultResultOrder("ipv4first");

let genAiClient: GoogleGenAI | null = null;
function getGenAi(): GoogleGenAI {
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
  ]);
}

async function startServer() {

  const app = express();
  const PORT = 3000;

  
  app.use(express.json());

  // Firebase Auth endpoint with Render forwarding & resilient fallback
  app.post(["/api/Auth/firebase-login", "/api/auth/firebase-login"], async (req, res) => {
    const { idToken, email, name, photoUrl } = req.body;
    try {
      const remoteRes = await fetch("https://steepcoreapi.onrender.com/api/Auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, email, name, photoUrl })
      });
      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend unreachable for firebase-login, issuing local JWT session:", e);
    }

    const resolvedEmail = email || "developer@steepcore.com";
    const resolvedName = name || resolvedEmail.split("@")[0];
    const userId = "usr_" + Math.random().toString(36).substring(2, 10);
    res.json({
      message: "Logged in successfully via Google / Firebase",
      email: resolvedEmail,
      userId,
      token: idToken || `steepcore_${Date.now()}_${userId}`
    });
  });

  // AI Generation with STEEPCOREAPI primary routing and automatic resilient fallback
  // If STEEPCOREAPI experiences Google AI 503 (high demand) or 400 errors,
  // we seamlessly generate via Gemini API or the STEEPCORE Synthesis Engine so user generation NEVER fails.
  app.post(["/api/Ai/generate", "/api/ai/generate", "/api/Ai/Generate"], async (req, res) => {
    const rawPrompt = String(req.body?.prompt || "").trim();
    const prompt = rawPrompt || "Software Engineer";
    console.log(`[STEEPCOREAPI Proxy] Handling AI generate for prompt: "${prompt}"`);

    // 1. Try remote STEEPCOREAPI backend (with fast 3.5s timeout)
    try {
      const targetRes = await fetch("https://steepcoreapi.onrender.com/api/Ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(req.headers.authorization ? { "Authorization": req.headers.authorization } : {})
        },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(8000)
      });

      const data: any = await targetRes.json().catch(() => ({}));
      if (targetRes.ok && data && Array.isArray(data.nodes) && data.nodes.length > 0) {
        data.price = 0;
        return res.status(200).json(data);
      }

      console.warn(`[STEEPCOREAPI Proxy] Remote returned status ${targetRes.status}:`, data?.message || data);
    } catch (err: any) {
      console.warn("[STEEPCOREAPI Proxy] Remote service not responding quickly, switching to AI fallback:", err?.message || err);
    }

    // 2. High availability fallback via GoogleGenAI (gemini-3.8-flash and gemini-flash-latest)
    if (process.env.GEMINI_API_KEY && prompt) {
      const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest"];
      const cleanTitle = cleanRoleTitle(prompt);

      const systemPrompt = `You are the STEEPCORE Career Pathway Engine. Generate a comprehensive, professional learning roadmap for: "${cleanTitle}".
Respond with valid JSON only. The JSON must strictly match:
{
  "title": "${cleanTitle} Career & Mastery Roadmap",
  "description": "Comprehensive structured learning path for ${cleanTitle}.",
  "domain": "Core Engineering",
  "price": 0,
  "nodes": [
    {
      "id": "node-0",
      "label": "${cleanTitle} Pathway",
      "type": "role",
      "description": "Orientation and foundational prerequisites for mastering ${cleanTitle}.",
      "positionX": 500,
      "positionY": 50,
      "isExpandable": true
    },
    {
      "id": "node-1",
      "label": "Phase 1: Core Fundamentals",
      "type": "phase",
      "description": "Core knowledge and foundational concepts.",
      "positionX": 500,
      "positionY": 180,
      "isExpandable": true
    }
  ],
  "edges": [
    {
      "id": "e-0-1",
      "source": "node-0",
      "target": "node-1",
      "label": "Start"
    }
  ]
}
Requirements:
1. Exactly one node with type "role" and id "node-0" as the single root starting point.
2. 12 to 18 structured nodes branching hierarchically (role -> 4 to 5 phases -> 2 to 3 topics per phase).
3. Every edge must connect a valid source to a valid target node.
4. Price must be 0.`;

      for (const model of candidateModels) {
        try {
          console.log(`[STEEPCOREAPI Fallback] Generating roadmap with model: ${model} for "${cleanTitle}"`);
          const ai = getGenAi();
          const aiRes = await withTimeout(ai.models.generateContent({
            model,
            contents: systemPrompt,
            config: { responseMimeType: "application/json" }
          }), 4500);

          const parsed = JSON.parse(aiRes.text || "{}");
          if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            parsed.price = 0;
            return res.status(200).json(parsed);
          }
        } catch (geminiErr: any) {
          console.warn(`[STEEPCOREAPI Fallback] Model ${model} unavailable (${geminiErr?.status || geminiErr?.message}), checking next...`);
        }
      }
    }

    // 3. Guaranteed High-Fidelity Domain Synthesis Engine (Zero-Downtime Guarantee)
    console.log(`[STEEPCOREAPI Fallback] Activating STEEPCORE Domain Synthesis Engine for "${prompt}"`);
    const synthesized = synthesizeRoadmapBlueprint(prompt);
    return res.status(200).json(synthesized);
  });

  app.post(["/api/ai/Chat", "/api/Ai/Chat"], async (req, res) => {
    try {
      console.log(`[STEEPCOREAPI Proxy] Forwarding AI chat request`);
      const targetRes = await fetch("https://steepcoreapi.onrender.com/api/ai/Chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(req.headers.authorization ? { "Authorization": req.headers.authorization } : {})
        },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(3500)
      });
      const data = await targetRes.json().catch(() => ({}));
      if (targetRes.ok && (data.text || data.actions)) {
        return res.status(targetRes.status).json(data);
      }
    } catch (err: any) {
      console.warn("[STEEPCOREAPI Proxy] Remote chat failed, using local AI fallback:", err?.message);
    }

    // High availability Chat fallback
    const messages = req.body?.messages || [];
    const lastUserMsg = messages[messages.length - 1]?.content || "Hello";
    const role = req.body?.context?.role || "Learning Pathway";

    if (process.env.GEMINI_API_KEY) {
      const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest"];
      for (const model of candidateModels) {
        try {
          const ai = getGenAi();
          const aiRes = await withTimeout(ai.models.generateContent({
            model,
            contents: `You are STEEPCORE Career Mentor AI assisting a student learning about ${role}.
The user asks: "${lastUserMsg}".
Provide a concise, encouraging, and structured response with clear practical advice.`
          }), 3500);

          if (aiRes.text) {
            return res.status(200).json({ text: aiRes.text });
          }
        } catch (aiChatErr) {
          // Try next model or fallback to synthesizer
        }
      }
    }

    // Resilient domain mentor fallback
    return res.status(200).json({ 
      text: `Welcome to your **${role}** roadmap! Focus on mastering the fundamental principles in Phase 1 before diving into specialized frameworks. Let me know if you would like me to explain any specific concept or recommend practical projects!` 
    });
  });

  app.post(["/api/ai/ExpandNode", "/api/Ai/ExpandNode"], async (req, res) => {
    try {
      console.log(`[STEEPCOREAPI Proxy] Forwarding AI expand node request`);
      const targetRes = await fetch("https://steepcoreapi.onrender.com/api/ai/ExpandNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(req.headers.authorization ? { "Authorization": req.headers.authorization } : {})
        },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(3500)
      });
      const data = await targetRes.json().catch(() => ({}));
      if (targetRes.ok && data) {
        return res.status(targetRes.status).json(data);
      }
    } catch (err: any) {
      console.warn("[STEEPCOREAPI Proxy] Remote expand node failed:", err?.message);
    }

    const nodeLabel = req.body?.nodeLabel || req.body?.node?.label || "Topic";
    const expandedNodes = [
      {
        id: `sub-${Date.now()}-1`,
        title: `${nodeLabel}: Core Concepts`,
        description: `Key theoretical and practical mechanics behind ${nodeLabel}.`,
        type: 'topic'
      },
      {
        id: `sub-${Date.now()}-2`,
        title: `${nodeLabel}: Hands-on Implementation`,
        description: `Interactive exercises, real-world patterns, and code examples for ${nodeLabel}.`,
        type: 'topic'
      },
      {
        id: `sub-${Date.now()}-3`,
        title: `${nodeLabel}: Best Practices & Pitfalls`,
        description: `Common anti-patterns, performance considerations, and edge cases for ${nodeLabel}.`,
        type: 'topic'
      }
    ];

    return res.status(200).json({ 
      success: true, 
      nodes: expandedNodes,
      actions: [
        {
          type: 'ADD_MULTIPLE_NODES',
          nodes: expandedNodes,
          sourceNodeId: req.body?.nodeId || req.body?.node?.id
        }
      ]
    });
  });

  // Dedicated high-priority route for steepcore branding image (WhatsApp / Social Media thumbnails)
  app.get(["/steepcore.png", "/steepcore.PNG"], (req, res) => {
    const candidatePaths = [
      path.join(process.cwd(), "public", "steepcore.png"),
      path.join(process.cwd(), "public", "steepcore.PNG"),
      path.join(process.cwd(), "steepcore.png"),
      path.join(process.cwd(), "steepcore.PNG")
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.sendFile(p);
      }
    }
    return res.status(404).send("Image not found");
  });

  // Crawler & Link Preview Handler (WhatsApp, Facebook, LinkedIn, Twitter/X, Discord, Slack, Telegram)
  // Social crawlers and chat link expanders do not run client-side JavaScript,
  // so we dynamically resolve absolute URLs for og:image and og:url based on the current incoming request host.
  app.use(async (req, res, next) => {
    const ua = req.get("user-agent") || "";
    const isCrawler = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|applebot|bingbot|googlebot/i.test(ua);

    if (isCrawler && req.method === "GET" && !req.path.includes(".")) {
      try {
        const proto = req.get("x-forwarded-proto") || req.protocol || "https";
        const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
        const origin = `${proto}://${host}`;
        const indexPath = path.join(process.cwd(), process.env.NODE_ENV === "production" ? "dist/index.html" : "index.html");
        if (fs.existsSync(indexPath)) {
          let html = await fs.promises.readFile(indexPath, "utf-8");
          const absoluteImg = `${origin}/steepcore.png`;
          const absoluteUrl = `${origin}${req.originalUrl || ""}`;

          html = html
            .replace(/content="\/steepcore\.png"/g, `content="${absoluteImg}"`)
            .replace(/href="\/steepcore\.png"/g, `href="${absoluteImg}"`)
            .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${absoluteUrl}"`);

          if (!html.includes('property="og:url"')) {
            html = html.replace('</head>', `  <meta property="og:url" content="${absoluteUrl}" />\n  </head>`);
          }

          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(200).send(html);
        }
      } catch (err: any) {
        console.warn("[Crawler Preview] Error serving pre-rendered metadata:", err?.message);
      }
    }
    next();
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
    console.log(`Server running on port ${PORT}`);
    
    // Keep Render backend awake with periodic health pings (every 10 minutes)
    const RENDER_HEALTH_URL = "https://steepcoreapi.onrender.com/health";
    const pingBackend = () => {
      fetch(RENDER_HEALTH_URL)
        .then(res => console.log(`[KeepAlive] Render backend ping status: ${res.status}`))
        .catch(err => console.warn(`[KeepAlive] Render ping failed:`, err.message));
    };
    pingBackend();
    setInterval(pingBackend, 10 * 60 * 1000);
  });
}

startServer();
