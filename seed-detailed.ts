import { createClient } from "@libsql/client";

const db = createClient({ url: "file:roadmaps.db" });

const frontendRoadmap = {
  "role": "Frontend Developer",
  "phases": [
    {
      "title": "1. Internet Fundamentals",
      "description": "How the web works under the hood.",
      "topics": [
        { "name": "How the Internet Works", "concepts": ["Browsers", "DNS", "HTTP/HTTPS", "Hosting"] },
        { "name": "Basic Web Architecture", "concepts": ["Client vs Server", "IP Addresses", "TCP/UDP"] }
      ]
    },
    {
      "title": "2. HTML & CSS",
      "description": "Building the structure and styling of web pages.",
      "topics": [
        { "name": "HTML5", "concepts": ["Semantic HTML", "Forms and Validations", "Accessibility (a11y)", "SEO Basics"] },
        { "name": "CSS Fundamentals", "concepts": ["Box Model", "Flexbox", "CSS Grid", "Responsive Design", "Media Queries"] },
        { "name": "Advanced CSS", "concepts": ["Animations", "Transitions", "CSS Variables", "SASS / SCSS", "BEM Architecture"] }
      ]
    },
    {
      "title": "3. JavaScript (The Language)",
      "description": "Adding interactivity to web pages.",
      "topics": [
        { "name": "JS Basics", "concepts": ["Variables", "Data Types", "Functions", "Loops", "Conditionals"] },
        { "name": "DOM Manipulation", "concepts": ["Selecting Elements", "Event Listeners", "Creating Elements", "Event Bubbling/Capturing"] },
        { "name": "Advanced JS (ES6+)", "concepts": ["Promises & Async/Await", "Closures", "Hoisting", "ES6 Modules", "Fetch API", "Event Loop"] }
      ]
    },
    {
      "title": "4. Package Managers & Build Tools",
      "description": "Managing dependencies and compiling code.",
      "topics": [
        { "name": "Package Managers", "concepts": ["NPM", "Yarn", "pnpm"] },
        { "name": "Build Tools", "concepts": ["Vite", "Webpack", "Esbuild", "Rollup"] },
        { "name": "Transpilers & Linters", "concepts": ["Babel", "ESLint", "Prettier"] }
      ]
    },
    {
      "title": "5. Frontend Frameworks",
      "description": "Building complex, reactive user interfaces.",
      "topics": [
        { "name": "React (Recommended)", "concepts": ["JSX", "Components", "Props & State", "Hooks (useEffect, useState)", "Context API"] },
        { "name": "Alternative Frameworks", "concepts": ["Vue.js", "Angular", "Svelte"] },
        { "name": "State Management", "concepts": ["Redux Toolkit", "Zustand", "Pinia (Vue)", "React Query"] }
      ]
    },
    {
      "title": "6. Advanced Frontend Concepts",
      "description": "Taking your applications to the next level.",
      "topics": [
        { "name": "TypeScript", "concepts": ["Types & Interfaces", "Generics", "Utility Types", "TS Configuration"] },
        { "name": "Testing", "concepts": ["Jest", "React Testing Library", "Cypress / Playwright (E2E)"] },
        { "name": "Performance", "concepts": ["Code Splitting", "Lazy Loading", "Web Vitals", "Memoization"] }
      ]
    },
    {
      "title": "7. Frameworks for SSR / SSG",
      "description": "Server-side rendering and static site generation.",
      "topics": [
        { "name": "Next.js", "concepts": ["App Router", "Server Components", "API Routes", "Data Fetching Strategies"] },
        { "name": "Others", "concepts": ["Nuxt.js (Vue)", "SvelteKit", "Astro", "Remix"] }
      ]
    }
  ]
};

const backendRoadmap = {
  "role": "Backend Developer",
  "phases": [
    {
      "title": "1. Internet & OS Fundamentals",
      "description": "Deep understanding of the environments your code runs in.",
      "topics": [
        { "name": "Internet Protocols", "concepts": ["TCP/IP", "HTTP/2 & HTTP/3", "WebSockets", "TLS/SSL"] },
        { "name": "OS & Linux Basics", "concepts": ["Terminal commands", "Processes vs Threads", "Memory Management", "I/O", "File Systems"] }
      ]
    },
    {
      "title": "2. Programming Language",
      "description": "Mastering a backend-focused language.",
      "topics": [
        { "name": "Node.js (JavaScript/TS)", "concepts": ["Event Loop", "Streams", "Buffers", "Express / NestJS"] },
        { "name": "Alternative Languages", "concepts": ["Python (Django/FastAPI)", "Go", "Java (Spring Boot)", "Rust"] }
      ]
    },
    {
      "title": "3. Relational Databases",
      "description": "Structured data storage and retrieval.",
      "topics": [
        { "name": "SQL Fundamentals", "concepts": ["PostgreSQL / MySQL", "Joins", "Aggregations", "Subqueries"] },
        { "name": "Database Design", "concepts": ["Normalization", "ACID", "Transactions", "Indexes", "Foreign Keys"] },
        { "name": "ORMs", "concepts": ["Prisma", "TypeORM", "Drizzle", "Sequelize"] }
      ]
    },
    {
      "title": "4. NoSQL & Caching",
      "description": "Unstructured data and high-performance data access.",
      "topics": [
        { "name": "NoSQL Databases", "concepts": ["MongoDB", "Cassandra", "DynamoDB", "Document vs Column-Family"] },
        { "name": "Caching", "concepts": ["Redis", "Memcached", "Cache Invalidation", "Read-Through vs Write-Through"] }
      ]
    },
    {
      "title": "5. APIs & Communication",
      "description": "Connecting services together.",
      "topics": [
        { "name": "RESTful APIs", "concepts": ["Verbs", "Status Codes", "HATEOAS", "Statelessness"] },
        { "name": "Modern API Paradigms", "concepts": ["GraphQL", "gRPC / Protobufs", "Webhooks"] },
        { "name": "Message Brokers", "concepts": ["RabbitMQ", "Apache Kafka", "Event-Driven Architecture", "Pub/Sub"] }
      ]
    },
    {
      "title": "6. Security",
      "description": "Protecting systems and user data.",
      "topics": [
        { "name": "Authentication & Authz", "concepts": ["JWT", "OAuth 2.0", "OIDC", "Session-based Auth", "Cookies vs Tokens"] },
        { "name": "Vulnerabilities", "concepts": ["OWASP Top 10", "SQL Injection", "XSS", "CSRF", "Rate Limiting", "CORS"] }
      ]
    },
    {
      "title": "7. Architecture & Deployment",
      "description": "Designing and hosting scalable systems.",
      "topics": [
        { "name": "System Design", "concepts": ["Microservices vs Monolith", "Load Balancing", "Horizontal vs Vertical Scaling", "CAP Theorem"] },
        { "name": "Containerization", "concepts": ["Docker", "Docker Compose", "Kubernetes Basics"] },
        { "name": "Cloud & CI/CD", "concepts": ["AWS / GCP / Azure", "GitHub Actions", "Serverless", "Infrastructure as Code"] }
      ]
    }
  ]
};

async function seed() {
  await db.execute({
    sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)",
    args: ["frontend", JSON.stringify(frontendRoadmap)]
  });
  await db.execute({
    sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)",
    args: ["backend", JSON.stringify(backendRoadmap)]
  });
  console.log("Seeded detailed Frontend and Backend roadmaps!");
}

seed().catch(console.error);

const fullStackRoadmap = {
  "role": "Full Stack Developer",
  "phases": [
    {
      "title": "1. Core Web Fundamentals",
      "description": "Understanding the foundation of the web.",
      "topics": [
        { "name": "Internet Basics", "concepts": ["HTTP/HTTPS", "DNS", "Domain Names", "Hosting"] },
        { "name": "Basic Frontend", "concepts": ["HTML5", "CSS3 Basics", "JavaScript ES6+ Basics"] }
      ]
    },
    {
      "title": "2. Advanced Frontend",
      "description": "Mastering modern UI development.",
      "topics": [
        { "name": "CSS Preprocessors & Frameworks", "concepts": ["Tailwind CSS", "Sass", "Responsive Design"] },
        { "name": "Frontend Frameworks", "concepts": ["React", "State Management (Redux/Zustand)", "Routing (React Router)"] },
        { "name": "Advanced JS & TS", "concepts": ["TypeScript", "Async/Await", "DOM Manipulation", "Webpack/Vite"] }
      ]
    },
    {
      "title": "3. Backend Fundamentals",
      "description": "Building the server and APIs.",
      "topics": [
        { "name": "Server Environment", "concepts": ["Node.js", "NPM/Yarn", "Event Loop"] },
        { "name": "Web Frameworks", "concepts": ["Express.js", "NestJS", "Middleware", "Routing"] },
        { "name": "API Design", "concepts": ["RESTful APIs", "GraphQL basics", "Postman / ThunderClient"] }
      ]
    },
    {
      "title": "4. Databases & ORMs",
      "description": "Storing and managing application data.",
      "topics": [
        { "name": "Relational (SQL)", "concepts": ["PostgreSQL", "Database Design", "Indexes", "Joins"] },
        { "name": "NoSQL", "concepts": ["MongoDB", "Mongoose", "Schema Design"] },
        { "name": "ORMs & Query Builders", "concepts": ["Prisma", "TypeORM", "Drizzle"] }
      ]
    },
    {
      "title": "5. Authentication & Security",
      "description": "Securing your full stack application.",
      "topics": [
        { "name": "Auth Strategies", "concepts": ["JWT", "OAuth", "Session-based Auth", "Cookies"] },
        { "name": "Web Security", "concepts": ["CORS", "Helmet", "Bcrypt", "XSS & CSRF Prevention", "Rate Limiting"] }
      ]
    },
    {
      "title": "6. DevOps & Deployment",
      "description": "Hosting and automating your apps.",
      "topics": [
        { "name": "Version Control", "concepts": ["Git", "GitHub/GitLab", "Branching Strategies"] },
        { "name": "Containerization", "concepts": ["Docker", "Docker Compose", "Writing Dockerfiles"] },
        { "name": "Deployment", "concepts": ["Vercel/Netlify", "Heroku/Render", "AWS EC2/S3 basics", "CI/CD basics"] }
      ]
    },
    {
      "title": "7. Advanced Topics",
      "description": "Taking your skills to a senior level.",
      "topics": [
        { "name": "Architecture", "concepts": ["Microservices vs Monolith", "Serverless", "WebSockets"] },
        { "name": "Testing", "concepts": ["Jest", "React Testing Library", "Cypress E2E Testing"] },
        { "name": "Performance", "concepts": ["Redis Caching", "Lighthouse", "Code Splitting"] }
      ]
    }
  ]
};

async function seedFullStack() {
  await db.execute({
    sql: "INSERT OR REPLACE INTO roadmaps (id, data) VALUES (?, ?)",
    args: ["full stack", JSON.stringify(fullStackRoadmap)]
  });
  console.log("Seeded detailed Full Stack roadmap!");
}
seedFullStack().catch(console.error);
