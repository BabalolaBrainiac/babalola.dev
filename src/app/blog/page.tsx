import BlogPageClient from './BlogPageClient'

// enable static generation with revalidation for blog listing
export const revalidate = 60 // revalidate every 60 seconds

export const metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://blog.babalola.dev' : 'http://localhost:3000'),
  title: "Blog - Babalola Opeyemi | Software Engineer | Technical Articles & Insights",
  description: "Technical articles by Babalola Opeyemi on backend engineering, MLOps, cloud infrastructure, Go, Python, and building production systems.",
  keywords: [
    "Software Engineering Blog",
    "Backend Development Articles",
    "MLOps",
    "Cloud Infrastructure Tutorials",
    "DevOps Automation Guides",
    "AWS Best Practices",
    "Microservices Architecture",
    "AI/ML Engineering",
    "System Design",
    "Go Engineering",
    "Infrastructure as Code",
    "Terraform Tutorials",
    "Technical Writing",
    "Engineering Insights"
  ],
  alternates: {
    canonical: 'https://blog.babalola.dev',
  },
  openGraph: {
    title: "Blog - Babalola Opeyemi | Software Engineer | Technical Articles & Insights",
    description: "Technical articles by Babalola Opeyemi on backend engineering, MLOps, cloud infrastructure, Go, Python, and building production systems.",
    url: "https://blog.babalola.dev",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Babalola Opeyemi - Software Engineer Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@brainiac_ope",
    creator: "@brainiac_ope",
    title: "Blog - Babalola Opeyemi | Software Engineer | Technical Articles & Insights",
    description: "Technical articles by Babalola Opeyemi on backend engineering, MLOps, cloud infrastructure, Go, Python, and building production systems.",
    images: ["/logo.svg"],
  },
}

export default function BlogPage() {
  return <BlogPageClient />
}