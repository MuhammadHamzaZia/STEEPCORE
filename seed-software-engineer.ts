import { createClient } from "@libsql/client";

const db = createClient({ url: "file:roadmaps.db" });

const softwareEngineerRoadmap = {
  "role": "Software Engineer",
  "phases": [
    {
      "title": "1. Prerequisites & Fundamentals",
      "description": "The absolute basics before writing robust code.",
      "topics": [
        {
          "name": "Command Line & Terminal",
          "concepts": ["Bash / Zsh", "File System Navigation", "Pipes and Redirects", "grep, awk, sed", "Environment Variables"]
        },
        {
          "name": "Version Control (Git)",
          "concepts": ["Basic Commands (add, commit, push)", "Branching and Merging", "Rebasing", "Pull Requests", "Resolving Merge Conflicts"]
        },
        {
          "name": "Networking Basics",
          "concepts": ["Internet Architecture", "HTTP/HTTPS", "TCP/IP Basics", "DNS", "WebSockets"]
        }
      ]
    },
    {
      "title": "2. Programming & Computer Science",
      "description": "Core computer science concepts that apply to any language.",
      "topics": [
        {
          "name": "Data Structures",
          "concepts": ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Hash Tables", "Trees & Tries", "Graphs"]
        },
        {
          "name": "Algorithms",
          "concepts": ["Sorting (Quick, Merge)", "Searching (Binary Search)", "Recursion", "Dynamic Programming", "Graph Traversal (BFS/DFS)"]
        },
        {
          "name": "Language Paradigms",
          "concepts": ["Object-Oriented Programming (OOP)", "Functional Programming", "Design Patterns (SOLID)", "Memory Management"]
        }
      ]
    },
    {
      "title": "3. Frontend Development",
      "description": "Building the user-facing side of applications.",
      "topics": [
        {
          "name": "Web Fundamentals",
          "concepts": ["HTML5 Semantic Elements", "CSS3 (Flexbox, Grid, Custom Properties)", "JavaScript (ES6+, Event Loop, Closures, Async/Await)", "DOM Manipulation"]
        },
        {
          "name": "Modern Frameworks",
          "concepts": ["React / Vue / Angular", "Component Lifecycle", "State Management (Redux, Zustand, Context)", "Routing"]
        },
        {
          "name": "Styling & Build Tools",
          "concepts": ["Tailwind CSS", "SASS / SCSS", "Vite / Webpack", "Babel / TypeScript", "NPM / Yarn / pnpm"]
        }
      ]
    },
    {
      "title": "4. Backend Development",
      "description": "Building APIs, business logic, and server infrastructure.",
      "topics": [
        {
          "name": "Server-Side Languages",
          "concepts": ["Node.js / Express", "Python (Django / FastAPI)", "Java (Spring Boot)", "Go / Rust", "C# (.NET)"]
        },
        {
          "name": "API Design",
          "concepts": ["RESTful APIs", "GraphQL", "gRPC", "WebSockets", "OpenAPI / Swagger"]
        },
        {
          "name": "Authentication & Authorization",
          "concepts": ["JWT (JSON Web Tokens)", "OAuth 2.0 / OIDC", "Session-based Auth", "SSO", "RBAC / ABAC"]
        }
      ]
    },
    {
      "title": "5. Databases & Caching",
      "description": "Storing, retrieving, and managing data efficiently.",
      "topics": [
        {
          "name": "Relational Databases",
          "concepts": ["PostgreSQL / MySQL", "SQL Queries & Joins", "Normalization", "Indexes & Performance", "ACID Properties", "Transactions"]
        },
        {
          "name": "NoSQL Databases",
          "concepts": ["Document Stores (MongoDB)", "Key-Value Stores (Redis)", "Column-Family (Cassandra)", "Graph DBs (Neo4j)"]
        },
        {
          "name": "Caching Strategies",
          "concepts": ["Redis / Memcached", "CDN Caching", "Client-side Caching", "Cache Invalidation strategies"]
        }
      ]
    },
    {
      "title": "6. Infrastructure & Deployment (DevOps)",
      "description": "Getting code from your machine to the users.",
      "topics": [
        {
          "name": "Containerization",
          "concepts": ["Docker basics", "Writing Dockerfiles", "Docker Compose", "Image Optimization"]
        },
        {
          "name": "CI/CD",
          "concepts": ["GitHub Actions / GitLab CI", "Automated Testing pipelines", "Blue/Green Deployments", "Canary Releases"]
        },
        {
          "name": "Cloud Providers",
          "concepts": ["AWS / GCP / Azure", "Serverless Architecture", "Infrastructure as Code (Terraform)", "Load Balancing"]
        }
      ]
    },
    {
      "title": "7. System Design & Architecture",
      "description": "Designing large-scale, fault-tolerant distributed systems.",
      "topics": [
        {
          "name": "Distributed Systems",
          "concepts": ["CAP Theorem", "Consistency Models", "Message Queues (Kafka, RabbitMQ)", "Event-Driven Architecture"]
        },
        {
          "name": "Scalability",
          "concepts": ["Vertical vs Horizontal Scaling", "Database Sharding", "Replication", "Rate Limiting"]
        },
        {
          "name": "Observability",
          "concepts": ["Logging (ELK Stack)", "Monitoring (Prometheus, Grafana)", "Distributed Tracing (Jaeger)", "Alerting"]
        }
      ]
    },
    {
      "title": "8. Security & Best Practices",
      "description": "Writing secure code and maintaining high quality.",
      "topics": [
        {
          "name": "Web Security",
          "concepts": ["OWASP Top 10", "XSS & CSRF", "SQL Injection", "CORS", "Content Security Policy (CSP)"]
        },
        {
          "name": "Testing",
          "concepts": ["Unit Testing (Jest, PyTest)", "Integration Testing", "E2E Testing (Cypress, Playwright)", "Test-Driven Development (TDD)"]
        },
        {
          "name": "Agile & Teamwork",
          "concepts": ["Scrum / Kanban", "Code Reviews", "Pair Programming", "Documentation"]
        }
      ]
    }
  ]
};

async function seed() {
  await db.execute({
    sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)",
    args: ["software engineer", JSON.stringify(softwareEngineerRoadmap)]
  });
  console.log("Seeded detailed Software Engineer roadmap!");
}

seed().catch(console.error);
