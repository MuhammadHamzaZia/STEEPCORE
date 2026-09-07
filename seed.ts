import { createClient } from "@libsql/client";

const db = createClient({ url: "file:roadmaps.db" });

const softwareEngineerRoadmap = {
  "role": "Software Engineer",
  "phases": [
    {
      "title": "Computer Science Fundamentals",
      "description": "Core concepts forming the foundation of software engineering.",
      "topics": [
        {
          "name": "Data Structures & Algorithms",
          "concepts": ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Searching", "Dynamic Programming"]
        },
        {
          "name": "Databases",
          "concepts": ["Relational (SQL)", "NoSQL", "ACID", "Normalization", "Indexing"]
        }
      ]
    },
    {
      "title": "Backend Development",
      "description": "Building the server-side logic and APIs.",
      "topics": [
        {
          "name": "Languages & Frameworks",
          "concepts": ["Node.js / Express", "Python / Django", "Java / Spring Boot", "Go"]
        },
        {
          "name": "System Design",
          "concepts": ["Microservices", "Load Balancing", "Caching", "Message Queues", "Scalability"]
        }
      ]
    }
  ]
};

const dsaTools = {
  "newNodes": [
    { "name": "LeetCode", "type": "topic" },
    { "name": "HackerRank", "type": "topic" },
    { "name": "Visualizer (e.g. VisuAlgo)", "type": "topic" }
  ]
};

async function seed() {
  await db.execute({
    sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)",
    args: ["software engineer", JSON.stringify(softwareEngineerRoadmap)]
  });
  
  await db.execute({
    sql: "INSERT OR REPLACE INTO expansions (id, data) VALUES (?, ?)",
    args: ["Data Structures & Algorithms_topic_tools", JSON.stringify(dsaTools)]
  });

  console.log("Seeded database with Software Engineer mock data.");
}

seed().catch(console.error);

const dataScientistRoadmap = {
  "role": "Data Scientist",
  "phases": [
    {
      "title": "Mathematics and Statistics",
      "description": "The mathematical foundation required for data science.",
      "topics": [
        {
          "name": "Linear Algebra & Calculus",
          "concepts": ["Vectors", "Matrices", "Derivatives", "Integrals"]
        },
        {
          "name": "Probability & Statistics",
          "concepts": ["Distributions", "Hypothesis Testing", "Bayes Theorem", "A/B Testing"]
        }
      ]
    },
    {
      "title": "Machine Learning",
      "description": "Building predictive models from data.",
      "topics": [
        {
          "name": "Supervised Learning",
          "concepts": ["Regression", "Classification", "Decision Trees", "Random Forests", "SVM"]
        },
        {
          "name": "Unsupervised Learning",
          "concepts": ["Clustering", "PCA", "Dimensionality Reduction"]
        }
      ]
    }
  ]
};

async function seedMore() {
  await db.execute({
    sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)",
    args: ["data scientist", JSON.stringify(dataScientistRoadmap)]
  });
  console.log("Seeded database with Data Scientist mock data.");
}
seedMore().catch(console.error);
