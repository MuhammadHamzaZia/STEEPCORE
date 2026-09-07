import { createClient } from "@libsql/client";
const db = createClient({ url: "file:roadmaps.db" });
async function test() {
  await db.execute(`CREATE TABLE IF NOT EXISTS embeddings_test (id TEXT, vec F32_BLOB(3));`);
  console.log("Vector table created successfully.");
}
test().catch(console.error);
