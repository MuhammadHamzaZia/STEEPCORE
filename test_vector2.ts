import { createClient } from "@libsql/client";
const db = createClient({ url: "file:roadmaps.db" });
async function test() {
  await db.execute(`INSERT INTO embeddings_test VALUES ('1', vector('[1.0, 2.0, 3.0]'));`);
  const res = await db.execute(`SELECT id, vector_distance_cos(vec, vector('[1.0, 2.0, 3.0]')) as dist FROM embeddings_test;`);
  console.log(res.rows);
}
test().catch(console.error);
