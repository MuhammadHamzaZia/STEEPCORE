/**
 * High-performance, domain-aware Career & Skill Roadmap Synthesis Engine
 * Provides resilient fallback roadmaps that match STEEPCORE standards
 */

export interface RoadmapNode {
  id: string;
  label: string;
  type: 'role' | 'phase' | 'topic' | 'project';
  description: string;
  positionX: number;
  positionY: number;
  isExpandable?: boolean;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface SynthesizedBlueprint {
  title: string;
  description: string;
  domain: string;
  price: number;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export function cleanRoleTitle(prompt: string): string {
  let cleaned = (prompt || 'Software Engineer').trim();
  cleaned = cleaned.replace(
    /^(i want to learn|i want to be an?|how to become an?|roadmap for( a| an)?|guide to( a| an)?|learning path for( a| an)?|step-by-step guide to( a| an)?|become an?|mastering|learning)\s+/i,
    ''
  ).trim();
  if (!cleaned) cleaned = 'Software Engineer';
  return cleaned
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface DomainPlan {
  domain: string;
  phases: {
    title: string;
    description: string;
    topics: { label: string; description: string; type?: 'topic' | 'project' }[];
  }[];
}

const DOMAIN_CATALOG: Record<string, DomainPlan> = {
  frontend: {
    domain: 'Web & Mobile',
    phases: [
      {
        title: 'Phase 1: Web Fundamentals',
        description: 'Semantic HTML5 structure, modern CSS3 layouts, and core JavaScript ES6+ runtime mechanics.',
        topics: [
          { label: 'Semantic HTML & Web Accessibility (a11y)', description: 'Accessible markup, ARIA roles, SEO meta structure, and DOM navigation.' },
          { label: 'Modern CSS, Flexbox & CSS Grid', description: 'Responsive layouts, CSS variables, animations, and container queries.' },
          { label: 'JavaScript Deep Dive (ES6+ & Async)', description: 'Closures, prototypes, Promises, async/await, Fetch API, and Event Loop.' }
        ]
      },
      {
        title: 'Phase 2: Modern Tooling & Environment',
        description: 'Command line workflows, Git version control, package management, and module bundlers.',
        topics: [
          { label: 'Git, GitHub & Branching Workflows', description: 'Version control, branch protection, pull requests, and merge conflict resolution.' },
          { label: 'Package Ecosystem & Build Tools (Vite)', description: 'NPM/PNPM package management, Vite bundler, and ES module resolution.' },
          { label: 'TypeScript for Frontend Applications', description: 'Strong typing, interfaces, generics, union types, and strict compiler configs.' }
        ]
      },
      {
        title: 'Phase 3: Component Frameworks & State',
        description: 'Production frontend architecture with React/Next.js and scalable state management.',
        topics: [
          { label: 'React Ecosystem & Modern Hooks', description: 'Component architecture, custom hooks, useEffect/useCallback, and Context.' },
          { label: 'Client & Server State Management', description: 'Zustand, TanStack Query, optimistic updates, and cache invalidation.' },
          { label: 'Tailwind CSS & Design Systems', description: 'Utility-first styling, component libraries, responsive breakpoints, and theming.' }
        ]
      },
      {
        title: 'Phase 4: Advanced Engineering & Testing',
        description: 'Testing suites, Web Vitals performance optimization, and web security best practices.',
        topics: [
          { label: 'Unit & End-to-End Testing (Jest / Playwright)', description: 'Automated test suites, component testing with Testing Library, and E2E journeys.' },
          { label: 'Core Web Vitals & Performance Tuning', description: 'Lighthouse scoring, code splitting, memoization, and lazy asset loading.' },
          { label: 'Web Security (OWASP, CORS, CSP)', description: 'Preventing XSS, CSRF mitigations, token storage safety, and Content Security Policy.' }
        ]
      },
      {
        title: 'Phase 5: Capstone & Career Launch',
        description: 'Full-featured enterprise production apps, portfolio creation, and technical interview readiness.',
        topics: [
          { label: 'Production SaaS Capstone Project', description: 'Build a multi-user interactive dashboard with authentication, database, and payments.', type: 'project' },
          { label: 'Technical Portfolio & Systems Interview', description: 'Architecture whiteboarding, live coding preparation, and deployment to cloud CDN.' }
        ]
      }
    ]
  },
  backend: {
    domain: 'Core Engineering',
    phases: [
      {
        title: 'Phase 1: Language & Runtime Mastery',
        description: 'Core programming language principles, memory models, data structures, and concurrency.',
        topics: [
          { label: 'Core Language Mechanics & Paradigms', description: 'In-depth mastery of syntax, memory management, and OOP/functional paradigms.' },
          { label: 'Data Structures & Algorithms in Practice', description: 'Big-O complexity, hash maps, binary trees, graphs, and efficient searching.' },
          { label: 'HTTP Protocol, REST & API Design', description: 'HTTP verbs, status codes, headers, payload validation, and clean endpoint naming.' }
        ]
      },
      {
        title: 'Phase 2: Database Systems & Persistence',
        description: 'Relational data modeling, SQL queries, indexing, and high-throughput NoSQL stores.',
        topics: [
          { label: 'Relational Databases (PostgreSQL / MySQL)', description: 'Schema design, normalization, ACID transactions, complex joins, and query plans.' },
          { label: 'Query Optimization & Indexing Strategies', description: 'B-tree vs Hash indexes, EXPLAIN ANALYZE, connection pooling, and migrations.' },
          { label: 'NoSQL & In-Memory Caching (Redis / Mongo)', description: 'Key-value caching, Redis pub/sub, TTL eviction, and document stores.' }
        ]
      },
      {
        title: 'Phase 3: Microservices & Distributed Architecture',
        description: 'Scalable service decomposition, message brokers, and inter-service communication.',
        topics: [
          { label: 'Event-Driven Architecture (Kafka / RabbitMQ)', description: 'Asynchronous event streaming, consumer groups, message ordering, and retry queues.' },
          { label: 'Authentication & Security (OAuth2 / JWT)', description: 'Stateless session tokens, refresh rotation, role-based access control (RBAC), and hashing.' },
          { label: 'gRPC & High-Throughput Remote Calls', description: 'Protocol buffers, binary serialization, bidirectional streaming, and microservice meshes.' }
        ]
      },
      {
        title: 'Phase 4: Reliability, Observability & DevOps',
        description: 'Monitoring system health, distributed tracing, automated deployment, and containerization.',
        topics: [
          { label: 'Docker Containerization & Multi-Stage Builds', description: 'Writing minimal Dockerfiles, layer caching, container security, and orchestration.' },
          { label: 'Observability (Prometheus, Grafana, OpenTelemetry)', description: 'Structured JSON logging, metrics, alerting thresholds, and distributed tracing.' },
          { label: 'CI/CD Pipelines & Zero-Downtime Releases', description: 'Automated testing workflows, blue-green deployments, and rolling updates.' }
        ]
      },
      {
        title: 'Phase 5: Scalable Capstone & System Design',
        description: 'Architecting high-scale distributed backend systems with fault tolerance.',
        topics: [
          { label: 'Distributed Event-Driven Platform Project', description: 'End-to-end backend service handling payments, transactional emails, and websockets.', type: 'project' },
          { label: 'System Design Interview & Architecture Review', description: 'Load balancing, rate limiting, database sharding, and high availability consensus.' }
        ]
      }
    ]
  },
  devops: {
    domain: 'Cloud & DevOps',
    phases: [
      {
        title: 'Phase 1: Linux & Systems Fundamentals',
        description: 'Linux operating systems, bash scripting, networking protocols, and system administration.',
        topics: [
          { label: 'Linux OS Internals & Shell Scripting', description: 'Process management, file permissions, systemd, bash automation, and cron jobs.' },
          { label: 'Computer Networking & Security (TCP/IP, DNS, SSL)', description: 'Subnets, CIDR, DNS propagation, TLS/SSL certificates, and firewalls.' },
          { label: 'Git & Collaboration Workflows', description: 'Git branching, tag releases, merge strategies, and repository governance.' }
        ]
      },
      {
        title: 'Phase 2: Containers & Orchestration',
        description: 'Docker containerization and Kubernetes cluster management.',
        topics: [
          { label: 'Docker & Container Security', description: 'Multi-stage builds, non-root users, container registries, and image vulnerability scanning.' },
          { label: 'Kubernetes Architecture & Pod Lifecycle', description: 'Nodes, Control Plane, Pods, Deployments, Services, and ReplicaSets.' },
          { label: 'K8s Networking, Ingress & Helm', description: 'Ingress controllers, Helm chart packaging, ConfigMaps, and Secrets management.' }
        ]
      },
      {
        title: 'Phase 3: Infrastructure as Code & Cloud',
        description: 'Automating cloud provisioning across AWS, GCP, or Azure with declarative tools.',
        topics: [
          { label: 'Terraform & Declarative Cloud IaC', description: 'HCL syntax, state management, remote backends, modules, and drift detection.' },
          { label: 'Cloud Architecture (AWS / GCP Fundamentals)', description: 'VPC design, IAM policies, compute instances, object storage, and serverless.' },
          { label: 'Configuration Management (Ansible)', description: 'Playbooks, idempotent configuration, SSH agent management, and inventory groups.' }
        ]
      },
      {
        title: 'Phase 4: CI/CD & Observability',
        description: 'Continuous integration and deployment pipelines with real-time telemetry.',
        topics: [
          { label: 'CI/CD Pipelines (GitHub Actions / GitLab CI)', description: 'Automated test runners, security scanning, semantic releases, and staging gates.' },
          { label: 'Monitoring & Alerting (Prometheus, Grafana, Loki)', description: 'PromQL queries, visual dashboards, SLI/SLO tracking, and incident escalation.' },
          { label: 'Site Reliability Engineering (SRE) & Chaos Testing', description: 'Error budgets, post-mortems, circuit breakers, and load testing with k6.' }
        ]
      },
      {
        title: 'Phase 5: Cloud Native Capstone & Certification',
        description: 'Deploying high-availability infrastructure with automated gitops pipelines.',
        topics: [
          { label: 'Production GitOps Kubernetes Platform', description: 'ArgoCD continuous delivery, automated TLS, ingress routing, and observability stack.', type: 'project' },
          { label: 'Cloud Architect & CKA Certification Prep', description: 'Certified Kubernetes Administrator (CKA) exam simulations and cloud architecture.' }
        ]
      }
    ]
  },
  datascience: {
    domain: 'AI & Data Science',
    phases: [
      {
        title: 'Phase 1: Mathematics & Python Foundations',
        description: 'Linear algebra, calculus, probability statistics, and Python scientific stack.',
        topics: [
          { label: 'Python for Data Analysis (NumPy & Pandas)', description: 'Vectorized computing, DataFrame manipulation, aggregation, and data cleaning.' },
          { label: 'Linear Algebra & Multivariable Calculus', description: 'Vectors, matrix multiplications, eigenvalues, gradients, and optimization.' },
          { label: 'Descriptive & Inferential Statistics', description: 'Distributions, hypothesis testing, p-values, confidence intervals, and regression.' }
        ]
      },
      {
        title: 'Phase 2: Exploratory Analysis & SQL',
        description: 'Extracting insights, data cleaning pipelines, and visual storytelling.',
        topics: [
          { label: 'Advanced SQL & Data Warehousing', description: 'Window functions, CTEs, schema modeling for data marts, and BigQuery / Snowflake.' },
          { label: 'Data Visualization & Storytelling (Matplotlib / Seaborn)', description: 'Exploratory data analysis (EDA), trend identification, and executive dashboards.' },
          { label: 'Data Preprocessing & Feature Engineering', description: 'Imputation, categorical encoding, feature scaling, and dimensionality reduction (PCA).' }
        ]
      },
      {
        title: 'Phase 3: Machine Learning Algorithms',
        description: 'Supervised and unsupervised statistical machine learning modeling.',
        topics: [
          { label: 'Supervised Learning (Regression & Classification)', description: 'Linear/Logistic regression, decision trees, random forests, and gradient boosting (XGBoost).' },
          { label: 'Unsupervised Learning & Clustering', description: 'K-Means, DBSCAN, anomaly detection, and customer segmentation.' },
          { label: 'Model Evaluation & Cross-Validation', description: 'ROC-AUC, Precision-Recall, cross-validation splits, bias-variance tradeoff, and tuning.' }
        ]
      },
      {
        title: 'Phase 4: Deep Learning & Modern AI',
        description: 'Neural networks, PyTorch, computer vision, and NLP with LLMs.',
        topics: [
          { label: 'Deep Neural Networks (PyTorch)', description: 'Tensors, backpropagation, CNNs, RNNs, and custom training loops.' },
          { label: 'Natural Language Processing & Transformers', description: 'Tokenization, embeddings, attention mechanisms, HuggingFace, and fine-tuning.' },
          { label: 'LLMs, RAG & Vector Databases', description: 'Retrieval Augmented Generation, vector search (Chroma / Pinecone), and prompt pipelines.' }
        ]
      },
      {
        title: 'Phase 5: MLOps & Production Capstone',
        description: 'Deploying predictive models to production APIs with drift monitoring.',
        topics: [
          { label: 'End-to-End Predictive Machine Learning App', description: 'Train, evaluate, and containerize a live predictive API with FastAPI and Docker.', type: 'project' },
          { label: 'MLOps Pipeline & Model Registry (MLflow)', description: 'Experiment tracking, model versioning, continuous training, and latency benchmarking.' }
        ]
      }
    ]
  },
  cybersecurity: {
    domain: 'Core Engineering',
    phases: [
      {
        title: 'Phase 1: Security & Networking Fundamentals',
        description: 'OS internals, network protocols, defensive security concepts, and cryptographic basics.',
        topics: [
          { label: 'Network Security (OSI Model, Wireshark, Firewalls)', description: 'Packet sniffing, protocol analysis, TCP handshake, port scanning, and routing security.' },
          { label: 'Linux / Windows System Hardening', description: 'User privileges, security policies, auditing, SSH keys, and patch management.' },
          { label: 'Cryptography Essentials (Symmetric, Asymmetric, PKI)', description: 'AES, RSA, ECC, hashing (SHA-256), SSL/TLS handshakes, and digital signatures.' }
        ]
      },
      {
        title: 'Phase 2: Defensive Security & SOC Analysis',
        description: 'Security operations, SIEM telemetry, threat detection, and incident response.',
        topics: [
          { label: 'SIEM Tools & Log Analysis (Splunk / ELK)', description: 'Correlating log events, writing detection rules, and identifying malicious anomalies.' },
          { label: 'Incident Response & Threat Hunting', description: 'Mitre ATT&CK framework, forensic artifact collection, and containment playbooks.' },
          { label: 'Endpoint Detection & Response (EDR)', description: 'Monitoring endpoints, detecting privilege escalation, and memory dump analysis.' }
        ]
      },
      {
        title: 'Phase 3: Offensive Security & Penetration Testing',
        description: 'Vulnerability assessment, ethical hacking methodologies, and exploitation.',
        topics: [
          { label: 'Reconnaissance & Vulnerability Scanning (Nmap, Nessus)', description: 'Passive/active recon, OSINT gathering, automated vulnerability discovery, and CVSS scoring.' },
          { label: 'Web Application Security (OWASP Top 10)', description: 'SQL injection, XSS, SSRF, broken access control, and Burp Suite interception.' },
          { label: 'Privilege Escalation & Lateral Movement', description: 'Linux/Windows local privilege escalation, misconfigurations, and credential dumping.' }
        ]
      },
      {
        title: 'Phase 4: Cloud Security & DevSecOps',
        description: 'Securing cloud platforms (AWS/Azure), container security, and CI/CD policy.',
        topics: [
          { label: 'Cloud Security Architecture (IAM, GuardDuty, KMS)', description: 'Least privilege access, S3 bucket hardening, cloud trail auditing, and zero trust.' },
          { label: 'DevSecOps & Static/Dynamic Code Analysis', description: 'SAST, DAST, dependency software composition analysis (SCA), and secrets scanning.' },
          { label: 'Infrastructure as Code Security (Checkov, Trivy)', description: 'Scanning Terraform scripts, Docker image layers, and Kubernetes RBAC policies.' }
        ]
      },
      {
        title: 'Phase 5: Security Capstone & Certifications',
        description: 'Hands-on penetration testing lab write-up and professional certifications.',
        topics: [
          { label: 'Penetration Testing Lab & Security Audit', description: 'Comprehensive audit report of a simulated enterprise environment with remediation steps.', type: 'project' },
          { label: 'Industry Certification Prep (Security+, OSCP, CEH)', description: 'Hands-on practical exam preparation and security analyst interview drills.' }
        ]
      }
    ]
  }
};

function detectDomainKey(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/front|react|vue|angular|web dev|javascript|typescript|css|html|ui/i.test(p)) return 'frontend';
  if (/back|node|express|api|go |golang|rust|python|c#|\.net|java|microservice|sql/i.test(p)) return 'backend';
  if (/devops|sre|cloud|aws|gcp|azure|kubernetes|docker|terraform|ci\/cd|infrastructure/i.test(p)) return 'devops';
  if (/data|ml|machine learning|ai|artificial intelligence|deep learning|nlp|llm|python/i.test(p)) return 'datascience';
  if (/sec|cyber|penetration|hack|soc|forensic|audit/i.test(p)) return 'cybersecurity';
  return 'general';
}

function generateDynamicPlan(role: string): DomainPlan {
  return {
    domain: 'Core Engineering',
    phases: [
      {
        title: 'Phase 1: Foundations & Core Principles',
        description: `Essential prerequisites, domain mechanics, and foundational knowledge required for ${role}.`,
        topics: [
          { label: `${role} Fundamentals & Theory`, description: `Core concepts, terminology, and foundational principles of ${role}.` },
          { label: 'Essential Tools & Work Environment', description: `Standard tooling, operating setups, and development environment best practices.` },
          { label: 'Core Methodologies & Standard Syntax', description: `Universal workflows, primary notation, and foundational techniques.` }
        ]
      },
      {
        title: 'Phase 2: Professional Tooling & Workflows',
        description: `Industry-standard tools, collaboration pipelines, and workflow automation.`,
        topics: [
          { label: 'Version Control & System Architecture', description: `Organizing structured projects, collaboration standards, and modular architecture.` },
          { label: 'Modern Tooling & Framework Ecosystem', description: `Working with the primary libraries, packages, and frameworks used in the industry.` },
          { label: 'Configuration & Environment Management', description: `Automating repetitive setups, dependency management, and reproducible workflows.` }
        ]
      },
      {
        title: 'Phase 3: Core Competencies & Deep Dives',
        description: `In-depth mastery of critical skills and architectural problem-solving.`,
        topics: [
          { label: `Advanced ${role} Implementation Patterns`, description: `Mastering high-level design patterns, clean abstractions, and complex logic.` },
          { label: 'Data Management & Integration Protocols', description: `Handling storage, external integrations, caching, and state flow.` },
          { label: 'Performance Optimization & Efficiency', description: `Benchmarking, eliminating bottlenecks, and engineering high-efficiency solutions.` }
        ]
      },
      {
        title: 'Phase 4: Production Quality & Security',
        description: `Automated testing, security hardening, compliance, and reliability assurance.`,
        topics: [
          { label: 'Testing Methodologies & Quality Assurance', description: `Automated test suites, unit testing, integration tests, and edge case coverage.` },
          { label: 'Security Best Practices & Hardening', description: `Vulnerability mitigations, access controls, data privacy, and compliance guidelines.` },
          { label: 'Monitoring, Telemetry & Maintenance', description: `System health monitoring, error tracking, debugging telemetry, and log auditing.` }
        ]
      },
      {
        title: 'Phase 5: Capstone Projects & Career Mastery',
        description: `Portfolio showcase, complex end-to-end deliverables, and professional qualification.`,
        topics: [
          { label: `Comprehensive ${role} Capstone Project`, description: `End-to-end multi-tier showcase project demonstrating mastery of all phases.`, type: 'project' },
          { label: 'Professional Portfolio & Industry Readiness', description: `Interview preparation, case study presentations, and career advancement.` }
        ]
      }
    ]
  };
}

export function synthesizeRoadmapBlueprint(prompt: string): SynthesizedBlueprint {
  const cleanTitle = cleanRoleTitle(prompt);
  const domainKey = detectDomainKey(cleanTitle);
  const plan = DOMAIN_CATALOG[domainKey] || generateDynamicPlan(cleanTitle);

  const nodes: RoadmapNode[] = [];
  const edges: RoadmapEdge[] = [];

  // 1. Root Node (Role)
  nodes.push({
    id: 'node-0',
    label: `${cleanTitle} Pathway`,
    type: 'role',
    description: `Complete, structured career pathway and competency roadmap for mastering ${cleanTitle}.`,
    positionX: 500,
    positionY: 50,
    isExpandable: true,
  });

  let currentNodeId = 1;

  plan.phases.forEach((phase, phaseIdx) => {
    const phaseNodeId = `node-${currentNodeId++}`;
    const phasePosY = 180 + phaseIdx * 200;

    // Connect to previous phase or root
    if (phaseIdx === 0) {
      edges.push({
        id: `e-node-0-${phaseNodeId}`,
        source: 'node-0',
        target: phaseNodeId,
        label: 'Start',
      });
    } else {
      const prevPhaseId = `node-${currentNodeId - (phase.topics.length + 2)}`;
      edges.push({
        id: `e-${prevPhaseId}-${phaseNodeId}`,
        source: prevPhaseId,
        target: phaseNodeId,
        label: `Phase ${phaseIdx + 1}`,
      });
    }

    // Add Phase Node
    nodes.push({
      id: phaseNodeId,
      label: phase.title,
      type: 'phase',
      description: phase.description,
      positionX: 500,
      positionY: phasePosY,
      isExpandable: true,
    });

    // Add Topic Nodes under Phase
    const topicCount = phase.topics.length;
    phase.topics.forEach((topic, topicIdx) => {
      const topicNodeId = `node-${currentNodeId++}`;
      // Distribute topics horizontally around phase node
      const horizontalOffset = (topicIdx - (topicCount - 1) / 2) * 260;
      const topicPosX = Math.max(100, Math.round(500 + horizontalOffset));
      const topicPosY = phasePosY + 90;

      nodes.push({
        id: topicNodeId,
        label: topic.label,
        type: topic.type || 'topic',
        description: topic.description,
        positionX: topicPosX,
        positionY: topicPosY,
        isExpandable: false,
      });

      edges.push({
        id: `e-${phaseNodeId}-${topicNodeId}`,
        source: phaseNodeId,
        target: topicNodeId,
        label: topic.type === 'project' ? 'Capstone' : 'Core',
      });
    });
  });

  return {
    title: `${cleanTitle} Career & Mastery Roadmap`,
    description: `Comprehensive interactive learning pathway and skill checkpoints for ${cleanTitle}.`,
    domain: plan.domain,
    price: 0,
    nodes,
    edges,
  };
}
