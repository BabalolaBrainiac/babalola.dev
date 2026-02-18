// Types
export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  tech: string[];
  category: 'security' | 'iac' | 'ai' | 'opensource';
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

// Projects Data
export const projects: Project[] = [
  {
    id: 'azath',
    name: 'azath.sh',
    tagline: 'AI-Powered Secret Scanner',
    description: 'Blazing-fast secret scanner protecting API keys and credentials from leaking into git.',
    fullDescription: 'A blazing-fast secret scanner that protects API keys, tokens, and credentials from leaking into git. Features AI-powered detection, 100+ patterns, and enterprise-grade security with SSO, audit logging, and compliance reporting.',
    tech: ['Go', 'AI/ML', 'CLI', 'Security', 'Enterprise'],
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
    id: 'coordin8',
    name: 'coordin8.io',
    tagline: 'Infrastructure as Code Platform',
    description: 'Type-safe TypeScript DSL with high-performance Go CLI for defining AWS resources.',
    fullDescription: 'A modern infrastructure as code platform combining a type-safe TypeScript DSL with a high-performance Go CLI. Define AWS resources with full IDE support, compile to JSON, and deploy with confidence.',
    tech: ['TypeScript', 'Go', 'IaC', 'AWS', 'DevOps'],
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
    fullDescription: 'Open-source MLOps toolkit with Terraform modules and Python utilities for building scalable machine learning pipelines. Includes SageMaker integration, feature stores, and model monitoring.',
    tech: ['Python', 'Terraform', 'AWS SageMaker', 'MLflow'],
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
    id: 'heysavi',
    title: 'Software Engineer',
    company: 'HeySavi LTD',
    period: '03/2025 - Present',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Designed organization-wide AWS IAM access management using Infrastructure as Code (Terraform), automating role-based permissions across environments and reducing manual configuration overhead by 80%',
      'Architected LLM-powered chat backend service integrating AWS SageMaker, AI agents, and external providers, enabling real-time conversational AI with sub-200ms response times',
      'Built reusable Terraform modules for provisioning AWS resources (Lambda, ECS, S3, IAM, SQS, SNS, EventBridge), standardizing infrastructure deployment and reducing setup time by 60%',
      'Developed event-driven data ingestion and processing pipelines using Lambda, S3, SQS, SNS, and Step Functions, processing millions of events daily with 99.9% reliability',
      'Integrated AI/ML inference pipelines, RAG systems, and agents via REST and WebSocket APIs, enabling real-time image analysis, semantic search, and intelligent recommendations',
      'Provisioned analytics and data lake streaming pipelines with S3 event triggers, Redshift integration, and CloudWatch monitoring, automating data governance and warehouse operations',
    ],
    tech: ['AWS SageMaker', 'Terraform', 'Lambda', 'ECS', 'S3', 'EventBridge', 'Redshift', 'Node.js', 'TypeScript', 'Python', 'WebSockets', 'DynamoDB', 'Pinecone'],
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
      'Conducted extracurricular sessions on programming and databases',
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
    id: 'devclusters',
    title: 'Backend Software Engineer',
    company: 'DevClusters',
    period: '02/2018 - 12/2021',
    location: 'Remote',
    type: 'fulltime',
    highlights: [
      'Developed and managed backend APIs for team networking',
      'Integrated various API providers enhancing functionality and UX',
      'Improved application performance by 20% through seamless integration',
      'Led major initiatives coordinating efforts across teams',
    ],
    tech: ['Backend APIs', 'System Integration', 'Performance Optimization', 'Team Leadership'],
  },
];

// Skills Data
export const skills: SkillCategory[] = [
  {
    category: 'languages',
    icon: '💻',
    items: ['Java', 'C#', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Golang'],
  },
  {
    category: 'frameworks',
    icon: '⚡',
    items: ['Spring Boot', 'ASP.NET Core', 'NestJS', 'React', 'Next.js', 'Node.js', 'ExpressJS'],
  },
  {
    category: 'cloud',
    icon: '☁️',
    items: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CloudFormation', 'SageMaker', 'Cloudflare Workers'],
  },
  {
    category: 'databases',
    icon: '🗄️',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'DynamoDB', 'Redis', 'Elasticsearch', 'Pinecone', 'Redshift'],
  },
  {
    category: 'devops',
    icon: '🔧',
    items: ['Git', 'Jenkins', 'Maven', 'Gradle', 'Ansible', 'Vagrant', 'CI/CD', 'GitHub Actions'],
  },
  {
    category: 'concepts',
    icon: '🧠',
    items: ['Microservices', 'Serverless', 'TDD', 'System Design', 'Event-driven Architecture', 'MLOps', 'LLM Integration', 'RAG Pipelines'],
  },
];

// Helper functions
export const getFeaturedProjects = () => projects.filter(p => p.featured);
export const getAllProjects = () => projects;
export const getProjectById = (id: string) => projects.find(p => p.id === id);
export const getProjectsByCategory = (category: Project['category']) => 
  projects.filter(p => p.category === category);
