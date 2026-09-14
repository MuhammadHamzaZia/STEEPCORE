const fs = require('fs');
const https = require('https');

const BASE_URL = 'https://steepcoreapi.onrender.com';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data ? JSON.parse(data) : null);
          } else {
            console.error(`Request failed with status ${res.statusCode}: ${data}`);
            resolve(null); // Don't crash on failure
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function processTree(nodes) {
  let result = [];
  if (!Array.isArray(nodes)) return result;
  
  for (const node of nodes) {
    if (!node.label) continue;
    const l = node.label.toLowerCase().trim();
    if (['horizontal node', 'vertical node'].includes(l) || l.length <= 1 || (/^[a-zA-Z0-9_\-]{20,25}$/.test(l) && l.length > 20)) {
      if (node.children) {
        result.push(...processTree(node.children));
      }
    } else {
      let item = { name: node.label };
      if (node.children && Array.isArray(node.children)) {
        item.children = processTree(node.children);
      }
      result.push(item);
    }
  }
  return result;
}

async function run() {
  console.log("Starting bulk insert...");
  // Register or Login
  let token = null;
  const username = "SteepcoreSystemAutomated";
  const email = "systemautomated@steepcore.com";
  const password = "Password123!";
  
  // Try register
  await request('POST', '/api/Auth/register', { username, email, password });
  
  // Try login
  const loginRes = await request('POST', '/api/Auth/login', { username, email, password });
  if (loginRes && loginRes.token) {
    token = loginRes.token;
    console.log("Successfully authenticated");
  } else {
    console.error("Failed to authenticate. Falling back to unauthenticated (might fail)");
  }

  const data = JSON.parse(fs.readFileSync('all_roadmaps_tree-1.json', 'utf8'));
  let count = 0;
  for (const [key, nodes] of Object.entries(data)) {
    if (key.includes('migration-mapping')) continue;
    const tree = processTree(nodes);
    if (tree.length === 0) continue;
    
    const formattedNodes = [];
    const formattedEdges = [];
    
    let nodeIdCounter = 1;
    function traverse(node, parentId = null, depth = 0, siblingIndex = 0) {
      const currentId = `n_${nodeIdCounter++}`;
      
      formattedNodes.push({
        id: currentId,
        label: node.name,
        type: depth === 0 ? 'phase' : (depth === 1 ? 'concept' : 'topic'),
        description: `Learn about ${node.name}`,
        positionX: depth * 250,
        positionY: siblingIndex * 150
      });
      
      if (parentId) {
        formattedEdges.push({
          source: parentId,
          target: node.name,
          label: ''
        });
      }
      
      if (node.children) {
        let childIdx = 0;
        for (const child of node.children) {
          traverse(child, node.name, depth + 1, childIdx++);
        }
      }
    }
    
    let rootIdx = 0;
    for (const rootNode of tree) {
      traverse(rootNode, null, 0, rootIdx++);
    }
    
    const title = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const payload = {
      title: title,
      description: `Complete roadmap and learning path for ${title}.`,
      price: 0,
      isPublished: true,
      domain: 'Technology',
      nodes: formattedNodes.map(n => ({
        label: n.label,
        type: n.type,
        description: n.description,
        positionX: n.positionX,
        positionY: n.positionY
      })),
      edges: formattedEdges.map(e => ({
        source: e.source,
        target: e.target,
        label: e.label
      }))
    };
    
    console.log(`Pushing roadmap: ${title}`);
    await request('POST', '/api/Blueprints', payload, token);
    count++;
    
    // Add small delay to not overwhelm the API
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`Finished pushing ${count} roadmaps.`);
}

run();
