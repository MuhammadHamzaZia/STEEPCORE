import { db } from '../config/db';

export class RagEngine {
  /**
   * Simulates a Retrieval-Augmented Generation (RAG) context fetch.
   * In a real advanced system, this would use pgvector or LibSQL vector search.
   * Here we use a fuzzy LIKE search to find existing nodes that match the domain.
   */
  static async findRelevantNodes(query: string) {
    const terms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    if (terms.length === 0) return [];

    // Simple search across node titles and descriptions
    const searchArg = `%${terms[0]}%`;
    const results = await db.execute({
      sql: `SELECT * FROM nodes WHERE title LIKE ? OR description LIKE ? LIMIT 10`,
      args: [searchArg, searchArg]
    });
    
    return results.rows;
  }
}
