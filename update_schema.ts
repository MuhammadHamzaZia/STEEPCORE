import { db } from './server/config/db';
async function update() {
  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN is_premium BOOLEAN DEFAULT 0`);
  } catch (e) {
    console.log("Column is_premium already exists.");
  }
  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN price DECIMAL(10,2) DEFAULT 0.0`);
  } catch (e) {
    console.log("Column price already exists.");
  }
  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN allow_data_training BOOLEAN DEFAULT 1`);
  } catch (e) {
    console.log("Column allow_data_training already exists on roadmaps_v2.");
  }
  try {
    await db.execute(`ALTER TABLE nodes ADD COLUMN allow_data_training BOOLEAN DEFAULT 1`);
  } catch (e) {
    console.log("Column allow_data_training already exists on nodes.");
  }
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      roadmap_id TEXT NOT NULL,
      stripe_transaction_id TEXT,
      amount_paid DECIMAL(10,2),
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps_v2 (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_creator_subscription_active BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  try {
    await db.execute(`ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00`);
  } catch(e) { console.log("wallet_balance exists"); }

  try {
    await db.execute(`ALTER TABLE users ADD COLUMN stripe_account_id TEXT`);
  } catch(e) { console.log("stripe_account_id exists"); }

  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN creator_id TEXT`);
  } catch(e) { console.log("creator_id exists"); }

  try {
    await db.execute(`ALTER TABLE purchases ADD COLUMN stripe_payment_intent_id TEXT`);
  } catch(e) { console.log("stripe_payment_intent_id exists"); }

  try {
    await db.execute(`ALTER TABLE purchases ADD COLUMN idempotency_key TEXT UNIQUE`);
  } catch(e) { console.log("idempotency_key exists"); }

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

  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN original_roadmap_id TEXT`);
  } catch(e) { console.log("original_roadmap_id exists"); }

  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN source TEXT DEFAULT 'original'`);
  } catch(e) { console.log("source exists"); }

  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN nodes_count INTEGER DEFAULT 0`);
  } catch(e) { console.log("nodes_count exists"); }

  try {
    await db.execute(`ALTER TABLE user_roadmaps ADD COLUMN percentage DECIMAL(5,2) DEFAULT 0.00`);
  } catch(e) { console.log("percentage exists"); }

  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN is_archived BOOLEAN DEFAULT 0`);
  } catch(e) { console.log("is_archived exists on roadmaps_v2"); }

  try {
    await db.execute(`ALTER TABLE roadmaps_v2 ADD COLUMN deleted_at DATETIME`);
  } catch(e) { console.log("deleted_at exists on roadmaps_v2"); }

  try {
    await db.execute(`ALTER TABLE users ADD COLUMN is_archived BOOLEAN DEFAULT 0`);
  } catch(e) { console.log("is_archived exists on users"); }

  try {
    await db.execute(`ALTER TABLE users ADD COLUMN deleted_at DATETIME`);
  } catch(e) { console.log("deleted_at exists on users"); }

  console.log("Schema updated.");
}
update().catch(console.error);
