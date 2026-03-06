// Types
export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  tech: string[];
  category: 'security' | 'iac' | 'ai' | 'opensource' | 'agent' | 'health';
  links: {
    website?: string;
    github?: string;
    docs?: string;
  };
  stats?: {
    label: string;
    value: string;
  }[];
  featured: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  type: 'fulltime' | 'contract' | 'parttime';
  highlights: string[];
  tech: string[];
  projects?: Project[];
}

export interface SkillCategory {
  category: string;
  icon: string;
  items: string[];
}

export interface OpenSourceContribution {
  organization: string;
  role: string;
  description: string;
  highlights: string[];
  links?: {
    website?: string;
    github?: string;
  };
}

// Projects Data
export const projects: Project[] = [
  {
    id: 'wardscribe',
    name: 'wardscribe.io',
    tagline: 'AI Agent Registry with OASF Compatibility',
    description: 'First production-ready AI agent registry implementing AGNTCY Open Agent Schema Framework (OASF) for cross-platform agent interoperability.',
    fullDescription: 'Building the first production-ready agent registry implementing AGNTCY Open Agent Schema Framework (OASF) for cross-platform agent interoperability. Features ML-based confidence scoring system (WardMind) with 8-dimensional quality evaluation, multi-provider LLM compatibility (OpenAI, Anthropic, Google, Groq, Ollama), and WardPack format for portable AI agent distribution with cryptographic signing.',
    tech: ['Go', 'TypeScript', 'Next.js', 'PostgreSQL', 'TimescaleDB', 'Redis', 'MeiliSearch', 'gRPC', 'GraphQL', 'AI/ML'],
    category: 'agent',
    links: {
      website: 'https://wardscribe.io',
    },
    stats: [
      { label: 'LLM Providers', value: '5+' },
      { label: 'Search Speed', value: '<50ms' },
    ],
    featured: true,
  },
  {
    id: 'azath',
    name: 'azath.sh',
    tagline: 'AI-Powered Secret Scanner',
    description: 'Blazing-fast secret scanner protecting API keys and credentials from leaking into git. Features custom-trained ML model for intelligent detection.',
    fullDescription: 'A blazing-fast Go CLI tool that detects 100+ secret patterns using hybrid AI + rule-based analysis. Features custom-trained "azath-scanner" model using Ollama for intelligent secrets detection with confidence scoring, privacy-preserving ML learning pipeline, semantic detection, entropy analysis, and smart false-positive filtering with ensemble scoring.',
    tech: ['Go', 'Ollama/LLMs', 'Local Model Training', 'Git Hooks', 'Pattern Matching', 'Cryptographic Analysis'],
    category: 'security',
    links: {
      website: 'https://azath.sh',
      github: 'https://github.com/azathsh/azath',
    },
    stats: [
      { label: 'Patterns', value: '100+' },
      { label: 'Scan Speed', value: '<1s' },
    ],
    featured: true,
  },
  {
    id: 'vent',
    name: 'vent.help',
    tagline: 'Mental Health Platform with AI Crisis Support',
    description: 'Anonymous venting platform with AI-powered audio transcription for live crisis calls and ML-based response suggestions.',
    fullDescription: 'Mental health-focused platform with anonymous venting and temporary posts. Implements AI audio transcription system for live crisis calls, converting speech to text for immediate analysis. Features ML model trained to analyze transcribed calls and generate context-aware response suggestions for support volunteers, with intelligent routing that detects urgency levels.',
    tech: ['Next.js 14', 'TypeScript', 'AI Audio Transcription', 'ML Model Training', 'PostgreSQL', 'Redis', 'Tailwind CSS'],
    category: 'health',
    links: {
      website: 'https://vent.help',
    },
    featured: true,
  },
  {
    id: 'coordin8',
    name: 'coordin8.io',
    tagline: 'Type-Safe Infrastructure as Code Platform',
    description: 'Infrastructure as Code platform combining TypeScript DSL with Go CLI for fast, reliable cloud resource provisioning.',
    fullDescription: 'A modern Infrastructure as Code platform combining a type-safe TypeScript DSL with a high-performance Go CLI for defining AWS resources. Features IDE support with autocomplete, automatic dependency detection, and workflow orchestration for serverless deployment pipelines.',
    tech: ['TypeScript', 'Go', 'AWS SDK', 'HCL', 'JSON', 'IaC'],
    category: 'iac',
    links: {
      website: 'https://coordin8.io',
      github: 'https://github.com/BabalolaBrainiac/coordin8',
    },
    stats: [
      { label: 'Resources', value: '50+' },
      { label: 'Type Safe', value: '100%' },
    ],
    featured: true,
  },
  {
    id: 'portfolio',
    name: 'babalola.dev',
    tagline: 'Personal Portfolio & Blog',
    description: 'Next.js portfolio with interactive blog, custom domain routing, and dark mode.',
    fullDescription: 'A modern portfolio website built with Next.js 13+ featuring a custom blog platform with markdown support, subdomain routing for blog.babalola.dev, dark mode theming, and interactive UI components.',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase'],
    category: 'opensource',
    links: {
      website: 'https://babalola.dev',
      github: 'https://github.com/BabalolaBrainiac/babalola.dev',
    },
    featured: false,
  },
  {
    id: 'ml-pipeline',
    name: 'ml-pipeline-kit',
    tagline: 'MLOps Pipeline Templates',
    description: 'Reusable Terraform and Python templates for ML training and inference pipelines.',
    fullDescription: 'Open-source MLOps toolkit with Terraform modules and Python utilities for building scalable machine learning pipelines. Includes SageMaker integration, feature stores, model monitoring, and RAG pipeline templates.',
    tech: ['Python', 'Terraform', 'AWS SageMaker', 'MLflow', 'RAG', 'Vector DBs'],
    category: 'ai',
    links: {
      github: 'https://github.com/BabalolaBrainiac/ml-pipeline-kit',
    },
    featured: false,
  },
];

// Experience Data with Projects
export const experiences: Experience[] = [
  {
    id: 'wardscribe',
    title: 'Lead Software Engineer',
    company: 'Wardscribe',
    period: '12/2025 - Present',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Architected and implemented the first production-ready AI agent registry implementing AGNTCY Open Agent Schema Framework (OASF) for cross-platform agent interoperability',
      'Designed ML-based confidence scoring system (WardMind) with 8-dimensional quality evaluation for agent performance assessment',
      'Built scalable Go backend API with REST, GraphQL, and gRPC serving agent registry, search, and confidence services',
      'Implemented multi-provider LLM compatibility layer supporting OpenAI, Anthropic, Google, Groq, and Ollama without code changes',
      'Designed WardPack format for portable AI agent distribution with cryptographic signing and version immutability',
      'Built CLI tool (Ward) for agent pull/deploy/publish workflows with OASF import/export capabilities',
      'Designed PostgreSQL + TimescaleDB schema for agent metadata, versioning, lineage tracking, and confidence history',
      'Integrated MeiliSearch for sub-50ms full-text agent discovery across 15 skill categories and 24 industry domains',
      'Implemented Cloudflare R2 object storage with CDN for immutable WardPack artifact distribution',
    ],
    tech: ['Go', 'TypeScript', 'Next.js', 'PostgreSQL', 'TimescaleDB', 'Redis', 'MeiliSearch', 'gRPC', 'GraphQL', 'OpenAI', 'Anthropic', 'Ollama', 'Cloudflare R2'],
  },
  {
    id: 'heysavi',
    title: 'Senior Software Engineer',
    company: 'HeySavi LTD',
    period: '03/2025 - Present',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Designed organization-wide AWS access management using Infrastructure as Code (Terraform), automating IAM roles, policies, and cross-account permissions across multiple environments',
      'Developing and maintaining LLM powered core chat backend service, integrating with Sagemaker, Agents, and external providers',
      'Developed and maintained reusable Terraform modules to provision and manage AWS resources, including Lambda, ECS, S3, IAM, SQS, SNS, EventBridge',
      'Worked on robust, event-driven data ingestion, processing, and transformation pipelines with AWS Lambda, S3, SQS, SNS, and StepFunctions',
      'Worked on integrating AI/ML, RAG and inference pipelines, agents and serving them via multiple API resources including REST and Websockets',
      'Provisioned and built analytics and data lake streaming pipelines with real-time S3 event triggers, Redshift integration, and comprehensive CloudWatch monitoring',
      'Automated infrastructure deployment, pipeline management, and operational tasks using Bash scripting and Linux',
      'Collaborated on data mapping, embedding, and AI-driven data transformation systems, utilizing Pinecone, OpenAI, and DynamoDB integrations',
    ],
    tech: ['AWS SageMaker', 'Terraform', 'Lambda', 'ECS', 'S3', 'EventBridge', 'Redshift', 'Node.js', 'TypeScript', 'Python', 'WebSockets', 'DynamoDB', 'Pinecone', 'RAG', 'LLM Integration'],
    projects: [
      {
        id: 'heysavi-ml-pipeline',
        name: 'ML Inference Pipeline',
        tagline: 'Real-time AI/ML Processing',
        description: 'Built scalable ML inference infrastructure for real-time image analysis and recommendations.',
        fullDescription: 'Architected and deployed a comprehensive ML inference pipeline using AWS SageMaker, Lambda, and EventBridge to process millions of images daily with sub-200ms latency.',
        tech: ['SageMaker', 'Lambda', 'EventBridge', 'Python'],
        category: 'ai',
        links: {},
        featured: false,
      },
      {
        id: 'heysavi-chat',
        name: 'LLM Chat Service',
        tagline: 'Conversational AI Backend',
        description: 'Real-time chat backend with AI agents and RAG for intelligent customer support.',
        fullDescription: 'Developed a WebSocket-based chat service integrating multiple LLM providers with RAG capabilities for context-aware responses and intelligent agent routing.',
        tech: ['WebSockets', 'Node.js', 'Pinecone', 'OpenAI'],
        category: 'ai',
        links: {},
        featured: false,
      },
    ],
  },
  {
    id: 'regxta',
    title: 'Senior Software Engineer',
    company: 'Regxta Global',
    period: '12/2023 - Present',
    location: 'Remote',
    type: 'contract',
    highlights: [
      'Leading and building high end, robust, scalable backend services for a revenue generating fintech startup',
      'Developed the core bill payments services, integrating all third party api providers, leading to a new revenue generating source for the startup, recording about 15% increase in total recurring revenue',
      'Provided leadership in the form of code reviews, bug fixes, and direct mentorship to Junior developers',
      'Collaborated closely with senior engineers to design and implement business logic and backend systems for client facing applications',
    ],
    tech: ['Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'REST APIs', 'Third-party Integrations'],
  },
  {
    id: 'spinwellness',
    title: 'Lead Backend Engineer',
    company: 'SpinWellness (Contract)',
    period: '11/2024 - 02/2025',
    location: 'Remote',
    type: 'contract',
    highlights: [
      'Architected and developed complete backend infrastructure using Next.js, Cloudflare Workers, and Terraform, enabling serverless deployment with zero-downtime capabilities',
      'Built RESTful APIs for waitlist management, user onboarding, and contact management, processing 10K+ requests daily with 99.95% uptime',
      'Implemented email notification systems using Resend API, automating user communications and reducing manual overhead by 90%',
      'Designed Infrastructure as Code using Terraform for Cloudflare Workers, KV storage, and D1 databases, ensuring consistent deployments across environments',
      'Developed admin dashboard APIs for waitlist management and analytics, enabling real-time insights into user growth metrics',
      'Optimized API response times to sub-100ms average latency through efficient database queries and caching strategies',
    ],
    tech: ['Next.js', 'TypeScript', 'Cloudflare Workers', 'Cloudflare D1', 'Terraform', 'Resend API', 'Serverless Architecture'],
    projects: [
      {
        id: 'spinwellness-api',
        name: 'Wellness Platform API',
        tagline: 'Serverless Health Tech Backend',
        description: 'Complete backend infrastructure for wellness platform with waitlist and user management.',
        fullDescription: 'Built a serverless API infrastructure using Cloudflare Workers and D1 database, handling user onboarding, waitlist management, and email notifications with 99.95% uptime.',
        tech: ['Cloudflare Workers', 'D1', 'Terraform', 'TypeScript'],
        category: 'iac',
        links: {},
        featured: false,
      },
    ],
  },
  {
    id: 'accessbank',
    title: 'Software Engineer',
    company: 'Access Bank PLC',
    period: '04/2023 - 03/2025',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Transformed backend architecture by implementing scalable microservices, improving system performance by 25% and reducing latency by 40% for 52M+ users',
      'Conducted design and code reviews, integrating network services across multiple platforms using SOAP and REST APIs (Safaricom, MPesa, RevPay), increasing system efficiency by 25%',
      'Proactively identified and drove architectural improvements, enhancing decision-making processes and reducing development time by 30%',
      'Optimized DevOps pipelines using AWS services, Docker, GitHub Actions, and Kubernetes, increasing deployment speed by 40% and reducing deployment failures by 50%',
      'Architected real-time data processing systems using Kafka and OLTP databases, handling millions of transactions daily with 99.99% reliability',
      'Developed Python automation scripts for operational tasks, reducing manual processing time by 60%',
    ],
    tech: ['C#', 'ASP.NET', '.NET Core', 'Java', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Kafka', 'PostgreSQL', 'MySQL', 'GitHub Actions', 'TurboRepo'],
    projects: [
      {
        id: 'access-kafka-pipeline',
        name: 'Real-time Transaction Pipeline',
        tagline: 'High-Throughput Data Processing',
        description: 'Kafka-based event streaming for processing millions of daily banking transactions.',
        fullDescription: 'Designed and implemented a Kafka-based event streaming architecture processing millions of banking transactions daily with 99.99% reliability and sub-second latency.',
        tech: ['Kafka', 'Java', 'PostgreSQL', 'Kubernetes'],
        category: 'opensource',
        links: {},
        featured: false,
      },
      {
        id: 'access-devops',
        name: 'CI/CD Platform',
        tagline: 'DevOps Automation Suite',
        description: 'Standardized deployment pipelines reducing release time by 40%.',
        fullDescription: 'Built a comprehensive CI/CD platform using GitHub Actions, Docker, and Kubernetes, standardizing deployment processes across 20+ microservices and reducing deployment failures by 50%.',
        tech: ['GitHub Actions', 'Docker', 'Kubernetes', 'AWS'],
        category: 'iac',
        links: {},
        featured: false,
      },
    ],
  },
  {
    id: 'edgehill',
    title: 'Undergraduate Tutor',
    company: 'EdgeHill University',
    period: '10/2023 - 12/2023',
    location: 'Ormskirk, UK',
    type: 'parttime',
    highlights: [
      'Conducted extracurricular sessions on programming and databases, enhancing students\' skills and performance',
      'Provided one-on-one mentoring for complex technical concepts',
      'Assisted faculty in preparing learning materials and evaluating projects',
    ],
    tech: ['Teaching', 'Mentoring', 'Database Design', 'Programming'],
  },
  {
    id: 'gipperpay',
    title: 'Lead Software Engineer',
    company: 'GipperPay',
    period: '05/2022 - 04/2023',
    location: 'Delaware, USA',
    type: 'fulltime',
    highlights: [
      'Developed scalable authentication microservice enhancing security and UX',
      'Led cross-functional team of 7 engineers delivering cryptocurrency products',
      'Increased market reach by 50% and transaction volumes by 60%',
      'Reduced time to market by 20% through streamlined processes',
    ],
    tech: ['.NET', 'C#', 'JavaScript', 'Python', 'AWS', 'Docker', 'Microservices'],
    projects: [
      {
        id: 'gipperpay-auth',
        name: 'Crypto Auth Service',
        tagline: 'Secure Authentication for Crypto',
        description: 'Scalable authentication microservice for cryptocurrency platform.',
        fullDescription: 'Architected and developed a high-performance authentication microservice handling 100K+ daily active users with JWT-based auth, 2FA, and wallet integration.',
        tech: ['.NET Core', 'C#', 'Redis', 'PostgreSQL'],
        category: 'security',
        links: {},
        featured: false,
      },
    ],
  },
  {
    id: 'binance',
    title: 'Software Engineer, Backend',
    company: 'Binance',
    period: '12/2021 - 12/2022',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Architected Cashlink P2P service processing $1.5M+ weekly transactions',
      'Improved transaction success rate by 15% and customer satisfaction by 25%',
      'Enhanced crypto social platform features, increasing user activity by 30%',
      'Collaborated across blockchain, backend, and frontend teams',
    ],
    tech: ['Node.js', 'TypeScript', 'Java', 'Spring Boot', 'C#', 'Docker', 'Blockchain'],
    projects: [
      {
        id: 'binance-cashlink',
        name: 'Cashlink P2P',
        tagline: 'Peer-to-Peer Crypto Exchange',
        description: 'P2P crypto trading platform processing $1.5M+ weekly transactions.',
        fullDescription: 'Built the backend for Cashlink P2P service enabling users to buy/sell crypto directly, processing over $1.5M in weekly transactions with escrow protection.',
        tech: ['Node.js', 'TypeScript', 'MongoDB', 'Redis'],
        category: 'security',
        links: {},
        featured: false,
      },
    ],
  },
  {
    id: 'motify',
    title: 'Backend Engineer',
    company: 'Motify',
    period: '01/2020 - 12/2021',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Developed scalable backend solutions using Java, .NET, and TypeScript, increasing platform performance by 30%',
      'Managed databases (PostgreSQL, MySQL, MongoDB), optimizing query performance by 25% and reducing latency',
      'Collaborated with frontend teams to ensure seamless integration and optimal user experience, resulting in a 20% improvement in application performance',
      'Led major initiatives and projects, coordinating efforts across teams to deliver impactful technology solutions',
      'Conducted design and code reviews, ensuring high standards of code quality and system stability',
    ],
    tech: ['Java', '.NET', 'TypeScript', 'PostgreSQL', 'MySQL', 'MongoDB', 'Backend Architecture'],
  },
  {
    id: 'devclusters',
    title: 'Backend Software Engineer',
    company: 'DevClusters',
    period: '02/2018 - 12/2020',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Developed and managed backend APIs for team networking, improving user authentication and data security',
      'Integrated various API providers, enhancing functionality and user experience across the application',
      'Collaborated with frontend teams to ensure seamless integration and optimal user experience, resulting in a 20% improvement in application performance',
      'Led major initiatives and projects, coordinating efforts across teams to deliver impactful technology solutions',
    ],
    tech: ['Backend APIs', 'System Integration', 'Performance Optimization', 'Team Leadership'],
  },
];

// Open Source & Community Contributions
export const openSourceContributions: OpenSourceContribution[] = [
  {
    organization: 'AGNTCY',
    role: 'Contributing Member',
    description: 'AGNTCY is the Linux Foundation project backed by Cisco, Google, Dell, Oracle, and Red Hat for AI agent interoperability standards.',
    highlights: [
      'Implementing Open Agent Schema Framework (OASF) for agent interoperability',
      'Contributing to open standards for AI agent deployment and cross-platform compatibility',
      'Building the first production-ready agent registry implementing OASF',
    ],
    links: {
      website: 'https://agntcy.org',
    },
  },
  {
    organization: 'MLOps Community',
    role: 'Lead Coordinator - Liverpool',
    description: 'Leading the MLOps community initiatives in Liverpool, fostering knowledge sharing and best practices in ML operations.',
    highlights: [
      'Lead coordinator for the MLOps community in Liverpool, organizing meetups and knowledge-sharing sessions',
      'Facilitating discussions on MLOps best practices, model deployment, and ML infrastructure',
      'Building local community of practice for machine learning operations and AI system architecture',
    ],
  },
];

// Skills Data
export const skills: SkillCategory[] = [
  {
    category: 'languages',
    icon: '💻',
    items: ['Java', 'C#', 'TypeScript', 'JavaScript', 'Python', 'Go/Golang', 'Rust'],
  },
  {
    category: 'frameworks',
    icon: '⚡',
    items: ['Spring Boot', 'ASP.NET Core', 'NestJS', 'React', 'Next.js', 'Node.js', 'ExpressJS'],
  },
  {
    category: 'cloud',
    icon: '☁️',
    items: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CloudFormation', 'SageMaker', 'Cloudflare Workers', 'Cloudflare R2'],
  },
  {
    category: 'databases',
    icon: '🗄️',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'DynamoDB', 'Redis', 'Elasticsearch', 'Pinecone', 'Redshift', 'TimescaleDB'],
  },
  {
    category: 'devops',
    icon: '🔧',
    items: ['Git', 'Jenkins', 'Maven', 'Gradle', 'Ansible', 'Vagrant', 'CI/CD', 'GitHub Actions'],
  },
  {
    category: 'ai/ml',
    icon: '🤖',
    items: ['LLM Integration', 'RAG Pipelines', 'MLOps', 'OpenAI', 'Anthropic', 'Ollama', 'SageMaker', 'Vector DBs', 'MeiliSearch'],
  },
  {
    category: 'protocols & apis',
    icon: '🔌',
    items: ['REST', 'GraphQL', 'gRPC', 'SOAP', 'WebSockets', 'Kafka', 'RabbitMQ', 'NATS.io', 'SQS'],
  },
  {
    category: 'concepts',
    icon: '🧠',
    items: ['Microservices', 'Serverless', 'TDD', 'System Design', 'Event-driven Architecture', 'AI Agents', 'OASF'],
  },
];

// Helper functions
export const getFeaturedProjects = () => projects.filter(p => p.featured);
export const getAllProjects = () => projects;
export const getProjectById = (id: string) => projects.find(p => p.id === id);
export const getProjectsByCategory = (category: Project['category']) => 
  projects.filter(p => p.category === category);
