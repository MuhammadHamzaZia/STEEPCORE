import fetch from 'node-fetch';

const prompts = [
  // IT & Software - Frontend
  "How to become a Senior React Developer",
  "Mastering Vue.js and Nuxt",
  "Learning path for Angular Developers",
  "Advanced CSS and Web Animation",
  "Complete guide to Web Accessibility (a11y)",
  
  // IT & Software - Backend
  "Mastering Node.js and Express",
  "Complete guide to Django and Python",
  "Architecting APIs with GraphQL",
  "Learning path for Ruby on Rails",
  "Spring Boot mastery for Java Developers",
  "Building robust APIs in Go",
  "Step-by-step guide to Elixir and Phoenix",
  "Understanding serverless architecture",
  
  // IT & Software - Systems & DevOps
  "Mastering CI/CD with GitHub Actions",
  "Complete roadmap to Terraform and IaC",
  "Advanced Docker and Containerization",
  "Learning path for SRE (Site Reliability Engineering)",
  "How to administer Linux servers",
  "Mastering Ansible for Automation",
  "Complete guide to AWS Certified Developer",
  
  // IT & Software - Data & AI
  "Roadmap to Data Engineering",
  "Mastering PyTorch for Deep Learning",
  "How to build MLOps pipelines",
  "Complete guide to Natural Language Processing",
  "Learning path for Computer Vision",
  "Mastering Apache Kafka and Event Streaming",
  "Guide to Snowflake and Data Warehousing",
  
  // IT & Software - Cyber Security
  "Roadmap to becoming an Ethical Hacker",
  "Mastering Cloud Security on Azure",
  "Complete guide to Penetration Testing",
  "Learning path for Security Operations Center (SOC) Analyst",
  "Understanding Cryptography fundamentals",
  
  // IT & Software - Game Dev
  "Mastering Unity and C#",
  "Complete guide to Unreal Engine 5",
  "Learning path for Game Audio Design",
  "How to write shaders for video games",
  "Building multiplayer games with Godot",
  
  // Business & Finance
  "Step-by-step guide to launching a B2B SaaS",
  "Mastering Product Management",
  "Learning path for a Financial Controller",
  "Complete guide to Startup Fundraising",
  "How to build a Growth Marketing engine",
  "Roadmap to becoming a Certified Public Accountant (CPA)",
  "Mastering B2B Enterprise Sales",
  "Guide to building an e-commerce brand",
  "Understanding cryptocurrency trading and DeFi",
  "Learning path for a Business Analyst",
  
  // Healthcare & Medical
  "Roadmap to becoming a Physical Therapist",
  "Complete guide to Medical Coding and Billing",
  "Learning path for a Dental Hygienist",
  "How to become a certified Personal Trainer",
  "Step-by-step guide to Clinical Psychology",
  "Roadmap to becoming a Pharmacist",
  "Understanding Public Health and Epidemiology",
  "Guide to becoming a Veterinary Technician",
  "Mastering Healthcare Administration",
  "Learning path for a Radiologic Technologist",
  
  // Automotive & Mechanics
  "Complete guide to Electric Vehicle (EV) Maintenance",
  "How to become an ASE Certified Master Mechanic",
  "Step-by-step guide to Auto Body Repair",
  "Roadmap to becoming a Diesel Mechanic",
  "Understanding Motorcycle Repair and Maintenance",
  "Learning path for an Aviation Maintenance Technician",
  "How to rebuild a small engine",
  "Mastering automotive diagnostics",
  "Guide to customizing and tuning cars",
  "Roadmap to becoming a Marine Mechanic",
  
  // Construction & Architecture
  "Complete guide to becoming a Master Plumber",
  "How to start a General Contracting business",
  "Roadmap to becoming an HVAC Technician",
  "Mastering Revit for BIM (Building Information Modeling)",
  "Learning path for a Landscape Architect",
  "Step-by-step guide to framing a house",
  "Understanding sustainable building materials",
  "Guide to becoming a certified Welder",
  "Roadmap to Heavy Equipment Operation",
  "Complete guide to Commercial Real Estate Development",
  
  // Creative & Design
  "Mastering Adobe After Effects",
  "Learning path for a 3D Character Artist",
  "Complete guide to UI/UX for Mobile Apps",
  "How to become a Professional Copywriter",
  "Step-by-step guide to Film Production",
  "Mastering Blender for 3D Modeling",
  "Roadmap to becoming a Creative Director",
  "Guide to Professional Photography",
  "Understanding Typography and Brand Identity",
  "Learning path for a Sound Designer",
  
  // Project-Based (Things to build)
  "How to build a custom mechanical keyboard from scratch",
  "Step-by-step guide to building a tiny house",
  "How to brew your own craft beer at home",
  "Building a custom PC water-cooling loop",
  "How to restore a classic muscle car",
  "Step-by-step guide to building a smart home system",
  "How to create a viral social media campaign",
  "Building an aquaponics garden",
  "How to write and publish a novel",
  "Step-by-step guide to making a feature-length documentary",
  "How to build a drone from parts",
  "Building a decentralized app (dApp) on Ethereum",
  "How to design and print 3D miniatures",
  "Step-by-step guide to starting a successful podcast",
  "How to build an off-grid solar power system",
  "Building a homelab for IT experiments",
  "How to start a coffee roasting business",
  "Step-by-step guide to building an arcade cabinet",
  "How to restore antique furniture",
  "Building a community garden from scratch"
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let TOKEN = "";

async function authenticate() {
  const username = "ai_agent_" + Date.now();
  const email = username + "@example.com";
  const password = "Password123!";
  
  const regRes = await fetch('https://steepcoreapi.onrender.com/api/Auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await regRes.json();
  if (data.token) {
    TOKEN = data.token;
    console.log("Authenticated successfully.");
  } else {
    throw new Error("Could not authenticate");
  }
}

async function generateAndSave(prompt, index) {
  try {
    console.log(`[${index + 1}/${prompts.length}] Generating: "${prompt}"`);
    
    // 1. Generate
    const res = await fetch('https://steepcoreapi.onrender.com/api/Ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!res.ok) {
      throw new Error(`Generate failed with status ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.title) {
      throw new Error('Generated data missing title');
    }
    
    // Set some defaults if missing so we don't get validation errors
    data.isPublished = true;
    
    // 2. Save
    const saveRes = await fetch('https://steepcoreapi.onrender.com/api/Blueprints', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(data)
    });
    
    if (!saveRes.ok) {
      const errText = await saveRes.text();
      throw new Error(`Save failed with status ${saveRes.status}: ${errText}`);
    }
    
    // 3. Optional: Publish it if there's a separate endpoint, but creating usually publishes it or requires it in the body.
    console.log(`✅ [${index + 1}/${prompts.length}] Saved: "${data.title}"`);
    return true;
  } catch (err) {
    console.error(`❌ [${index + 1}/${prompts.length}] Error for "${prompt}":`, err.message);
    return false;
  }
}

async function run() {
  await authenticate();
  console.log(`Starting generation of ${prompts.length} blueprints...`);
  
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batch = prompts.slice(i, i + BATCH_SIZE);
    const promises = batch.map((prompt, j) => generateAndSave(prompt, i + j));
    
    await Promise.all(promises);
    
    if (i + BATCH_SIZE < prompts.length) {
      console.log(`Waiting 2 seconds before next batch...`);
      await delay(2000); 
    }
  }
  
  console.log('Finished generating blueprints!');
}

run();
