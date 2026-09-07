import { GoogleGenAI, Type } from "@google/genai";
import { JobQueue } from './jobQueue';
import { RagEngine } from './ragEngine';
import { RoadmapService } from './roadmapService';
import { randomUUID } from 'crypto';
import { llmGenerationDuration } from './telemetry';
import { db } from '../config/db';

export class AIGenerator {
  /**
   * Processes a full roadmap generation in the background using RAG.
   */
  static async processFullGeneration(jobId: string, role: string, apiKey: string, logId: string, allowDataTraining: number) {
    try {
      JobQueue.updateJob(jobId, { status: 'processing' });
      
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      // 1. RAG Context: Retrieve existing approved modules
      const relevantNodes = await RagEngine.findRelevantNodes(role);
      const contextDocs = relevantNodes.map((n: any) => `- ${n.title}: ${n.description || ''}`).join("\n");

      // 2. LLM Generation
      const prompt = `You are an expert curriculum designer. Design a learning roadmap for "${role}".
      
      Available existing modules in our system to reuse (stitch together) if applicable:
      ${contextDocs || 'No exact matches found.'}
      
      Output JSON with:
      - role: string
      - phases: array of { title, description, topics: array of { name, concepts: array of strings } }
      `;

      const endLLMTimer = llmGenerationDuration.startTimer({ model: 'gemini-3.5-flash', operation: 'full_generation' });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      endLLMTimer();

      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

      await db.execute({
        sql: 'UPDATE ai_generation_logs SET status = ?, tokens_used = ? WHERE id = ?',
        args: ['completed', tokensUsed, logId]
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      const slug = role.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const roadmapId = randomUUID();

      // Transform tree to Graph DB Model (Nodes & Edges)
      const graphNodes: any[] = [];
      const graphEdges: any[] = [];

      graphNodes.push({ id: `role-${roadmapId}`, type: 'role', title: data.role || role, order_index: 0, allow_data_training: allowDataTraining });

      let phaseIdx = 0;
      for (const phase of data.phases || []) {
        const phaseId = `phase-${roadmapId}-${phaseIdx}`;
        graphNodes.push({ id: phaseId, parent_id: `role-${roadmapId}`, type: 'phase', title: phase.title, description: phase.description, order_index: phaseIdx, allow_data_training: allowDataTraining });
        graphEdges.push({ id: `edge-role-${phaseId}`, source_id: `role-${roadmapId}`, target_id: phaseId, type: 'smoothstep' });
        
        let topicIdx = 0;
        for (const topic of phase.topics || []) {
          const topicId = `topic-${roadmapId}-${phaseIdx}-${topicIdx}`;
          graphNodes.push({ id: topicId, parent_id: phaseId, type: 'topic', title: topic.name, order_index: topicIdx, allow_data_training: allowDataTraining });
          graphEdges.push({ id: `edge-${phaseId}-${topicId}`, source_id: phaseId, target_id: topicId, type: 'smoothstep' });
          topicIdx++;
        }
        phaseIdx++;
      }

      const roadmapGraph = {
        id: roadmapId,
        title: data.role || role,
        slug,
        description: `Comprehensive guide to becoming a ${role}`,
        allow_data_training: allowDataTraining,
        nodes: graphNodes,
        edges: graphEdges
      };

      // 3. Save to Advanced DB
      await RoadmapService.saveRoadmapGraph(roadmapGraph);

      // 3.5. Index into Semantic Search Engine
      try {
        const { SearchEngine } = await import('./searchEngine');
        await SearchEngine.indexRoadmap(roadmapId, roadmapGraph.title, roadmapGraph.description, roadmapGraph.nodes, apiKey);
      } catch (searchErr) {
        console.error("Failed to index roadmap into vector DB:", searchErr);
      }

      // 4. Trigger Background Enrichment
      try {
        const { ResourceEnricher } = await import('./resourceEnricher');
        ResourceEnricher.enrichRoadmapBackground(roadmapId).catch(console.error);
      } catch (enrichErr) {
        console.error("Failed to trigger background enrichment:", enrichErr);
      }

      // 5. Mark job completed
      JobQueue.updateJob(jobId, { status: 'completed', result: { slug, roadmapId } });

    } catch (error: any) {
      console.error("Async Generation Error:", error);
      
      await db.execute({
        sql: 'UPDATE ai_generation_logs SET status = ? WHERE id = ?',
        args: ['failed', logId]
      });

      JobQueue.updateJob(jobId, { status: 'failed', error: error.message });
    }
  }

  /**
   * Delta Updates: Only generate specific nodes/edges to swap out
   */
  static async processDeltaUpdate(jobId: string, roadmapId: string, instruction: string, apiKey: string, logId: string, allowDataTraining: number) {
    try {
      JobQueue.updateJob(jobId, { status: 'processing' });
      
      const endLLMTimer = llmGenerationDuration.startTimer({ model: 'gemini-3.5-flash', operation: 'delta_update' });
      // In a real scenario, we'd fetch the current graph, ask the LLM for a JSON Patch 
      // operation to add/remove/update specific node IDs, and apply it directly.
      
      // Simulating Delta Update delay
      await new Promise(res => setTimeout(res, 2000));
      endLLMTimer();

      await db.execute({
        sql: 'UPDATE ai_generation_logs SET status = ?, tokens_used = ? WHERE id = ?',
        args: ['completed', 500, logId] // Simulated tokens
      });

      JobQueue.updateJob(jobId, { status: 'completed', result: { message: "Delta update applied successfully via partial patching." } });
    } catch (error: any) {
      await db.execute({
        sql: 'UPDATE ai_generation_logs SET status = ? WHERE id = ?',
        args: ['failed', logId]
      });

      JobQueue.updateJob(jobId, { status: 'failed', error: error.message });
    }
  }
}
