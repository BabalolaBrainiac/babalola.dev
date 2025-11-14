import BlogPageClient from './BlogPageClient'

// enable static generation with revalidation for blog listing
export const revalidate = 60 // revalidate every 60 seconds

export const metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://blog.babalola.dev' : 'http://localhost:3000'),
  title: "Blog - Babalola Opeyemi | Software Engineer | Technical Articles & Insights",
  description: "Read technical articles, insights, and tutorials by Babalola Opeyemi. Covering backend development, cloud infrastructure, DevOps automation, AWS, microservices, and AI/ML engineering.",
  keywords: [
    "Software Engineering Blog",
    "Backend Development Articles",
    "Cloud Infrastructure Tutorials",
    "DevOps Automation Guides",
    "AWS Best Practices",
    "Microservices Architecture",
    "AI/ML Engineering",
    "System Design",
    "Database Optimization",
    "Performance Tuning",
    "Infrastructure as Code",
    "Terraform Tutorials",
    "Kubernetes Guides",
    "Python Development",
    "C# Programming",
    "Java Development",
    "Node.js Tutorials",
    "PostgreSQL Optimization",
    "Fintech Development",
    "Banking Software",
    "Technical Writing",
    "Engineering Insights"
  ],
  openGraph: {
    title: "Blog - Babalola Opeyemi | Software Engineer | Technical Articles & Insights",
    description: "Read technical articles, insights, and tutorials by Babalola Opeyemi. Covering backend development, cloud infrastructure, DevOps automation, AWS, microservices, and AI/ML engineering.",
    url: "https://blog.babalola.dev",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Babalola Opeyemi - Software Engineer Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Babalola Opeyemi | Software Engineer | Technical Articles & Insights",
    description: "Read technical articles, insights, and tutorials by Babalola Opeyemi. Covering backend development, cloud infrastructure, DevOps automation, AWS, microservices, and AI/ML engineering.",
    images: ["/og-image.jpg"],
  },
}

export default function BlogPage() {
  return <BlogPageClient />
}