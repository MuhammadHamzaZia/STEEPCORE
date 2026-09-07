import { createClient } from "@libsql/client";

export const db = createClient({ url: "file:roadmaps.db" });

export async function initDB() {
  // Legacy tables
  await db.execute(`CREATE TABLE IF NOT EXISTS roadmaps (id TEXT PRIMARY KEY, data TEXT)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS expansions (id TEXT PRIMARY KEY, data TEXT)`);

  // --- Advanced Schema (Etsy-like Roadmap Store) ---
  
  // 1. Categories Table (Hierarchical)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE CASCADE
    )
  `);

  // 2. Roadmaps Table (Like products in a store)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS roadmaps_v2 (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      version INTEGER DEFAULT 1,
      is_published BOOLEAN DEFAULT 0,
      is_premium BOOLEAN DEFAULT 0,
      price DECIMAL(10,2) DEFAULT 0.00,
      creator_id TEXT,
      original_roadmap_id TEXT,
      source TEXT DEFAULT 'original',
      nodes_count INTEGER DEFAULT 0,
      is_archived BOOLEAN DEFAULT 0,
      deleted_at DATETIME,
      allow_data_training BOOLEAN DEFAULT 1,
      metadata JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    )
  `);

  // 3. Nodes Table (Flexible items in a roadmap)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      roadmap_id TEXT NOT NULL,
      parent_id TEXT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      allow_data_training BOOLEAN DEFAULT 1,
      metadata JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps_v2 (id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES nodes (id) ON DELETE CASCADE
    )
  `);

  // 4. Edges Table (For complex graph relationships between nodes)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS edges (
      id TEXT PRIMARY KEY,
      roadmap_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT DEFAULT 'smoothstep',
      label TEXT,
      metadata JSON,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps_v2 (id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES nodes (id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES nodes (id) ON DELETE CASCADE
    )
  `);

  // 5. Resources Table (Learning materials attached to nodes)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      node_id TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL,
      locale TEXT DEFAULT 'en-US',
      votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (node_id) REFERENCES nodes (id) ON DELETE CASCADE
    )
  `);

  // 6. User Customizations / Progress
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_roadmaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      original_roadmap_id TEXT NOT NULL,
      progress JSON,
      percentage DECIMAL(5,2) DEFAULT 0.00,
      custom_nodes JSON,
      custom_edges JSON,
      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (original_roadmap_id) REFERENCES roadmaps_v2 (id) ON DELETE CASCADE
    )
  `);

  // 7. Semantic Search Embeddings
  await db.execute(`
    CREATE TABLE IF NOT EXISTS roadmap_embeddings (
      roadmap_id TEXT PRIMARY KEY,
      embedding F32_BLOB(768),
      content_text TEXT,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps_v2 (id) ON DELETE CASCADE
    )
  `);

  // 8. Purchases Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      roadmap_id TEXT NOT NULL,
      stripe_transaction_id TEXT,
      stripe_payment_intent_id TEXT,
      idempotency_key TEXT UNIQUE,
      amount_paid DECIMAL(10,2),
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps_v2 (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 9. Users Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_creator_subscription_active BOOLEAN DEFAULT 0,
      wallet_balance DECIMAL(10,2) DEFAULT 0.00,
      stripe_account_id TEXT,
      is_archived BOOLEAN DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 10. AI Generation Logs Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ai_generation_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      allow_data_training BOOLEAN DEFAULT 1,
      tokens_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 11. Creator Payouts
  await db.execute(`
    CREATE TABLE IF NOT EXISTS creator_payouts (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'processing',
      stripe_transfer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
}
