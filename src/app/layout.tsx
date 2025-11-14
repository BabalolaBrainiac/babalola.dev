import "./globals.css";
import { SessionProvider } from './components/SessionProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'

export const metadata = {
	metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://babalola.dev' : 'http://localhost:3000'),
	title: "Babalola Opeyemi - Senior Backend Engineer | AI/ML Infrastructure Specialist | Cloud Architect",
	description: "Results-driven Senior Software Engineer with 5+ years of expertise architecting and deploying enterprise-grade backend systems, AI/ML infrastructure, and cloud-native solutions. Proven track record scaling platforms serving 52M+ users and processing $1.5M+ weekly transactions.",
	keywords: [
		"Software Engineer",
		"Backend Developer", 
		"Cloud Infrastructure",
		"ML Infrastructure",
		"DevOps Automation",
		"AWS Engineer",
		"Microservices",
		"Fintech Developer",
		"Banking Software",
		"AI/ML Engineer",
		"Remote Developer UK",
		"Remote Developer Nigeria",
		"Terraform Engineer",
		"Kubernetes Engineer",
		"Python Developer",
		"C# Developer",
		"Java Developer",
		"Node.js Developer",
		"PostgreSQL Expert",
		"System Design",
		"Scalable Architecture",
		"Enterprise Solutions",
		"API Development",
		"Database Design",
		"CI/CD Pipeline",
		"Infrastructure as Code",
		"Machine Learning Operations",
		"MLOps Engineer",
		"Data Pipeline Engineer",
		"Event-driven Architecture",
		"Real-time Processing",
		"High-performance Systems",
		"Security Engineering",
		"Performance Optimization",
		"Senior Backend Engineer",
		"AI/ML Infrastructure",
		"Cloud Architect",
		"SageMaker",
		"LLM Integration",
		"RAG Pipelines",
		"Serverless Computing",
		"Infrastructure Automation"
	],
	authors: [{ name: "Babalola Opeyemi", url: "https://babalola.dev" }],
	creator: "Babalola Opeyemi",
	publisher: "Babalola Opeyemi",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		locale: 'en_GB',
		url: 'https://babalola.dev',
		siteName: 'Babalola Opeyemi - Senior Backend Engineer',
		title: 'Babalola Opeyemi - Senior Backend Engineer | AI/ML Infrastructure Specialist | Cloud Architect',
		description: 'Results-driven Senior Software Engineer with 5+ years of expertise architecting and deploying enterprise-grade backend systems, AI/ML infrastructure, and cloud-native solutions.',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Babalola Opeyemi - Software Engineer Portfolio',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		site: '@brainiac_ope',
		creator: '@brainiac_ope',
		title: 'Babalola Opeyemi - Senior Backend Engineer | AI/ML Infrastructure Specialist | Cloud Architect',
		description: 'Results-driven Senior Software Engineer with 5+ years of expertise architecting and deploying enterprise-grade backend systems, AI/ML infrastructure, and cloud-native solutions.',
		images: ['/og-image.jpg'],
	},
	alternates: {
		canonical: 'https://babalola.dev',
	},
	verification: {
		google: process.env.GOOGLE_SITE_VERIFICATION || '',
	},
	icons: {
		icon: [
			{ url: '/favicon.svg', type: 'image/svg+xml' },
			{ url: '/favicon.ico', sizes: '32x32' },
		],
		shortcut: '/favicon.ico',
		apple: '/favicon.svg',
	},
	manifest: '/manifest.json',
	category: 'technology',
	classification: 'Software Engineering Portfolio',
	other: {
		'geo.region': 'GB',
		'geo.placename': 'United Kingdom',
		'geo.position': '53.4808;-2.2426',
		'ICBM': '53.4808, -2.2426',
		'DC.title': 'Babalola Opeyemi - Software Engineer',
		'DC.creator': 'Babalola Opeyemi',
		'DC.subject': 'Software Engineering, Backend Development, Cloud Infrastructure, DevOps',
		'DC.description': 'Experienced Software Engineer specializing in backend development, cloud/ML infrastructure, and DevOps automation',
		'DC.publisher': 'Babalola Opeyemi',
		'DC.contributor': 'Babalola Opeyemi',
		'DC.date': '2024',
		'DC.type': 'Text',
		'DC.format': 'text/html',
		'DC.identifier': 'https://babalola.dev',
		'DC.source': 'https://babalola.dev',
		'DC.language': 'en',
		'DC.relation': 'https://babalola.dev',
		'DC.coverage': 'United Kingdom, Nigeria',
		'DC.rights': 'Copyright 2024 Babalola Opeyemi',
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" data-theme="dark">
			<head>
				{/* Structured Data for SEO */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Person",
							"name": "Babalola Opeyemi",
							"jobTitle": "Senior Backend Engineer",
							"description": "Results-driven Senior Software Engineer with 5+ years of expertise architecting and deploying enterprise-grade backend systems, AI/ML infrastructure, and cloud-native solutions.",
							"url": "https://babalola.dev",
							"image": "https://babalola.dev/og-image.jpg",
							"sameAs": [
								"https://linkedin.com/in/babalola-opeyemi",
								"https://github.com/BabalolaBrainiac",
								"https://twitter.com/brainiac_ope",
								"https://medium.com/@babaloladanielope"
							],
							"address": {
								"@type": "PostalAddress",
								"addressCountry": "GB",
								"addressRegion": "England"
							},
							"alumniOf": [
								{
									"@type": "EducationalOrganization",
									"name": "EdgeHill University",
									"address": {
										"@type": "PostalAddress",
										"addressCountry": "GB"
									}
								},
								{
									"@type": "EducationalOrganization", 
									"name": "University of Ilorin",
									"address": {
										"@type": "PostalAddress",
										"addressCountry": "NG"
									}
								}
							],
							"worksFor": [
								{
									"@type": "Organization",
									"name": "HeySavi LTD",
									"jobTitle": "Senior Software Engineer"
								},
								{
									"@type": "Organization",
									"name": "Access Bank PLC",
									"jobTitle": "Software Engineer"
								}
							],
							"knowsAbout": [
								"Backend Development",
								"Cloud Infrastructure",
								"Machine Learning Operations",
								"DevOps Automation",
								"AWS",
								"Microservices",
								"System Design",
								"Python",
								"C#",
								"Java",
								"Node.js",
								"PostgreSQL",
								"Terraform",
								"Kubernetes",
								"Docker",
								"Fintech",
								"Banking Software",
								"AI/ML Infrastructure"
							],
							"hasOccupation": {
								"@type": "Occupation",
								"name": "Senior Backend Engineer",
								"occupationLocation": {
									"@type": "Country",
									"name": "United Kingdom"
								},
								"skills": "Backend Development, AI/ML Infrastructure, MLOps, Cloud Architecture, Microservices, Serverless Computing, Infrastructure Automation, SageMaker, LLM Integration"
							}
						})
					}}
				/>
			</head>
			<body>
				<ThemeProvider>
					<SessionProvider>
						{children}
					</SessionProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
