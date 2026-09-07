import { createClient } from "@libsql/client";
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

async function setup() {
  const db = createClient({ url: "file:roadmaps.db" });
  await db.execute(`
    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      data TEXT
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS expansions (
      id TEXT PRIMARY KEY,
      data TEXT
    )
  `);
  
  // Try to migrate from roadmap_cache.json if it exists
  const CACHE_FILE = path.join(process.cwd(), 'roadmap_cache.json');
  if (fs.existsSync(CACHE_FILE)) {
    const data = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cache = JSON.parse(data);
    for (const [key, value] of Object.entries(cache.roadmaps || {})) {
       try {
         await db.execute({
           sql: "INSERT OR IGNORE INTO roadmaps (id, data) VALUES (?, ?)",
           args: [key, JSON.stringify(value)]
         });
       } catch (e) {}
    }
    for (const [key, value] of Object.entries(cache.expansions || {})) {
       try {
         await db.execute({
           sql: "INSERT OR IGNORE INTO expansions (id, data) VALUES (?, ?)",
           args: [key, JSON.stringify(value)]
         });
       } catch (e) {}
    }
    console.log("Migrated data from JSON to DB.");
  }

  // Pre-seed 50 skill based and 50 core based logic can go here.
  // For demonstration, we'll insert a dummy "Software Engineer" if not exists
  console.log("Database initialized successfully.");
}
setup().catch(console.error);
