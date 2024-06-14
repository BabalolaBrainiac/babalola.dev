import { algorithms, devnotes, oscs, nnapt, sgapidc } from "../assets";

export const navLinks = [
  {
    id: "hero",
    title: "Hero",
  },
  {
    id: "portfolio",
    title: "Portfolio",
  },
  {
    id: "experience",
    title: "Experience",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const experiences = [
  {
    title: "Senior Backend Software Engineer",
    company_name: "Access Bank PLC",
    date: "04/2023 - Present",
    details: [
      "Transformed the backend of Primus Plus, servicing over <span style='color: white;'>52,000,000 clients</span> across Africa, by implementing scalable microservices, improving performance and reliability.",
      "<span style='color: white;'>Enhanced system efficiency by 25%</span> through design and code reviews, integrating network services across platforms using SOAP and REST APIs with Safaricom, MPesa, and RevPay.",
      "Optimized DevOps pipeline using AWS services, integrating GitHub Actions with TurboRepo, Dockerizing services, and managing containers with Kubernetes, leading to a <span style='color: white;'>40% increase in deployment speed</span>.",
    ],
  },
  {
    title: "Undergraduate Tutor (Part Time)",
    company_name: "EdgeHill University | Ormskirk, United Kingdom",
    date: "10/2023 - 12/2023",
    details: [
      "Conducted extracurricular sessions on programming and databases, <span style='color: white;'>enhancing students' skills and performance</span>.",
      "Monitored and assessed student progress, providing <span style='color: white;'>constructive feedback and guidance</span>.",
      "<span style='color: white;'>Utilized effective communication skills</span> to explain complex concepts in an understandable manner.",
    ],
  },
  {
    title: "Software Engineer",
    company_name: "Binance",
    date: "12/2021 - 12/2022",
    details: [
      "Architected and developed Cashlink, a high volume Fiat Crypto/P2P service <span style='color: white;'>processing over $1.5M weekly</span>, within a tight one month deadline.",
      "Contributed to a crypto/blockchain social media platform, enhancing content processing and user engagement features, <span style='color: white;'>leading to a 30% increase in user activity</span>.",
      "Collaborated with cross-functional teams (backend, blockchain, frontend) at Binance and Bundle Africa to develop internal tools using Node.js, Typescript, Java/Spring Boot, and C#/ASP.Net, <span style='color: white;'>contributing to the overall success</span> of both companies.",
    ],
  },
  {
    title: "Backend Software Engineer",
    company_name: "DevClusters",
    date: "02/2018 - 12/2021 ",
    details: [
      "Developed and managed backend APIs for team networking, <span style='color: white;'>improving user authentication and data security</span>.",
      "<span style='color: white;'>Integrated various API providers,</span> enhancing functionality and user experience across the application.",
      "Led major initiatives and projects, <span style='color: white;'>coordinating efforts across teams</span> to deliver impactful technology solutions.",
    ],
  },
];

const portfolio = [
  {
    name: "99apartments",
    description:
      "A comprehensive platform featuring extensive apartment listings, detailed property information, advanced search filters, tenant reviews, online booking, and property management tools, aimed at simplifying the rental process for both tenants and property owners.",
    image: nnapt,
  },
  {
    name: "SafeGarageNG",
    description:
      "API documentation for SafeGarageNG, a robust platform enabling users to seamlessly search for and secure parking spots.",
    image: sgapidc,
  },
  {
    name: "Visually Understanding Algorithms",
    description:
      "A showcase of animated algorithms coded using TypeScript, with the video garnering over 400,000 views.",
    image: algorithms,
  },
  {
    name: "Visually Understanding Algorithms",
    description:
      "A showcase of animated algorithms coded using TypeScript, with the video garnering over 400,000 views.",
    image: algorithms,
  },
  {
    name: "Visually Understanding Algorithms",
    description:
      "A showcase of animated algorithms coded using TypeScript, with the video garnering over 400,000 views.",
    image: algorithms,
  },
  {
    name: "Visually Understanding Algorithms",
    description:
      "A showcase of animated algorithms coded using TypeScript, with the video garnering over 400,000 views.",
    image: algorithms,
  },
];

export { experiences, portfolio };
