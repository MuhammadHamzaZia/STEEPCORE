import { createClient } from "@libsql/client";
import fs from 'fs';

const db = createClient({ url: "file:roadmaps.db" });
const data = JSON.parse(fs.readFileSync('all_roadmaps_tree-1.json', 'utf8'));

function isNoise(label: string) {
  if (!label) return true;
  const l = label.toLowerCase().trim();
  if (['horizontal node', 'vertical node'].includes(l)) return true;
  if (/^[a-zA-Z0-9_\-]{20,25}$/.test(l) && l.length > 20) return true; // matches ids
  if (l.length <= 1) return true;
  return false;
}

function processTree(nodes: any[]): any[] {
    let result: any[] = [];
    if (!Array.isArray(nodes)) return result;
    for (const node of nodes) {
        if (isNoise(node.label)) {
            if (node.children) {
                result.push(...processTree(node.children));
            }
        } else {
            let item: any = { name: node.label };
            if (node.children && Array.isArray(node.children)) {
                item.children = processTree(node.children);
            }
            result.push(item);
        }
    }
    return result;
}

async function seed() {
    let count = 0;
    for (const [key, nodes] of Object.entries(data)) {
        if (key.includes('migration-mapping')) continue;
        
        const tree = processTree(nodes as any[]);
        if (tree.length === 0) continue;
        
        let phases = [];
        
        for (const phaseNode of tree) {
            let phase: any = {
                title: phaseNode.name,
                description: `Learning phase for ${phaseNode.name}`,
                topics: []
            };
            if (phaseNode.children) {
                for (const topicNode of phaseNode.children) {
                    let topic: any = {
                        name: topicNode.name,
                        concepts: []
                    };
                    if (topicNode.children) {
                        for (const conceptNode of topicNode.children) {
                            topic.concepts.push(conceptNode.name);
                        }
                    }
                    phase.topics.push(topic);
                }
            } else {
                // If no children, create a single topic
                phase.topics.push({
                    name: phaseNode.name + " Basics",
                    concepts: []
                });
            }
            phases.push(phase);
        }
        
        let roadmapData = {
            role: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            phases: phases
        };
        
        const cleanKey = key.replace(/-/g, ' ').toLowerCase();
        await db.execute({
            sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)",
            args: [cleanKey, JSON.stringify(roadmapData)]
        });
        count++;
    }
    console.log(`Seeded ${count} roadmaps from JSON to DB.`);
}

seed().catch(console.error);
