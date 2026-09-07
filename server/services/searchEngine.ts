import { db } from '../config/db';
import { GoogleGenAI } from '@google/genai';
import { PIIStripper } from './piiStripper';

export class SearchEngine {
  /**
   * Generates a 768-dimensional embedding vector for the given text using Gemini.
   */
  static async generateEmbedding(text: string, apiKey: string): Promise<number[]> {
    const sanitizedText = PIIStripper.sanitize(text);
    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    
    // Using the text-embedding-004 model
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: sanitizedText,
    });
    
    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error("Failed to generate embeddings.");
    }
    
    return response.embeddings[0].values || [];
  }

  /**
   * Indexes a roadmap into the vector database.
   */
  static async indexRoadmap(roadmapId: string, title: string, description: string, nodes: any[], apiKey: string) {
    // Construct a rich document representing the roadmap
    const nodeTitles = nodes.map(n => n.title).join(', ');
    const documentText = `Roadmap: ${title}. Description: ${description || ''}. Key Topics: ${nodeTitles}`;
    
    const vector = await this.generateEmbedding(documentText, apiKey);
    
    // Convert array to a format expected by libSQL vector('[x, y, z]')
    const vectorStr = `[${vector.join(',')}]`;
    
    await db.execute({
      sql: `INSERT OR REPLACE INTO roadmap_embeddings (roadmap_id, embedding, content_text)
            VALUES (?, vector(?), ?)`,
      args: [roadmapId, vectorStr, documentText]
    });
    
    console.log(`[Search Engine] Indexed roadmap ${roadmapId} with vector.`);
  }

  /**
   * Semantic Search using cosine distance.
   * Returns roadmaps sorted by similarity to the query.
   */
  static async semanticSearch(query: string, apiKey: string, limit: number = 5) {
    const queryVector = await this.generateEmbedding(query, apiKey);
    const vectorStr = `[${queryVector.join(',')}]`;

    // Retrieve closest matches using vector_distance_cos
    // Lower cosine distance means higher similarity.
    const results = await db.execute({
      sql: `
        SELECT 
          r.id, r.title, r.slug, r.description,
          vector_distance_cos(e.embedding, vector(?)) as distance
        FROM roadmap_embeddings e
        JOIN roadmaps_v2 r ON e.roadmap_id = r.id
        WHERE r.is_published = 1 AND r.is_archived = 0
        ORDER BY distance ASC
        LIMIT ?
      `,
      args: [vectorStr, limit]
    });

    return results.rows;
  }

  /**
   * Auto-complete/Fuzzy match for fast "type-ahead" search.
   * Uses SQL LIKE with ranking simulation.
   */
  static async autocomplete(query: string, limit: number = 5) {
    const term = `%${query.trim().toLowerCase()}%`;
    const results = await db.execute({
      sql: `
        SELECT id, title, slug 
        FROM roadmaps_v2 
        WHERE is_published = 1 AND is_archived = 0 AND (LOWER(title) LIKE ? OR LOWER(slug) LIKE ?)
        LIMIT ?
      `,
      args: [term, term, limit]
    });

    return results.rows;
  }
}
