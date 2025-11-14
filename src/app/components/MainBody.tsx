'use client';

import React, { useState, useEffect } from 'react';
import { getBlogUrl } from '@/lib/urls';

export default function MainBody() {
	const [typedText, setTypedText] = useState('');
	const fullText = 'Senior Software Engineer';
	const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);

	const getSkillIcon = (category: string) => {
		const icons: { [key: string]: string } = {
			'languages': '💻',
			'frameworks': '⚡',
			'cloud': '☁️',
			'databases': '🗄️',
			'devops': '🔧',
			'concepts': '🧠'
		};
		return icons[category] || '🔧';
	};

	useEffect(() => {
		// Typing animation
		let i = 0;
		const timer = setInterval(() => {
			if (i < fullText.length) {
				setTypedText(fullText.slice(0, i + 1));
				i++;
			} else {
				clearInterval(timer);
			}
		}, 100);

		return () => clearInterval(timer);
	}, []);

	const nextExperience = () => {
		setCurrentExperienceIndex((prev) => (prev + 1) % experiences.length);
	};

	const prevExperience = () => {
		setCurrentExperienceIndex((prev) => (prev - 1 + experiences.length) % experiences.length);
	};

	const experiences = [
		{
			title: "Senior Software Engineer",
			company: "HeySavi LTD",
			period: "03/2025 - Present",
			location: "Remote",
			highlights: [
				"Designed organization-wide AWS IAM access management using Infrastructure as Code (Terraform), automating role-based permissions across environments and reducing manual configuration overhead by 80%",
				"Architected LLM-powered chat backend service integrating AWS SageMaker, AI agents, and external providers, enabling real-time conversational AI with sub-200ms response times",
				"Built reusable Terraform modules for provisioning AWS resources (Lambda, ECS, S3, IAM, SQS, SNS, EventBridge), standardizing infrastructure deployment and reducing setup time by 60%",
				"Developed event-driven data ingestion and processing pipelines using Lambda, S3, SQS, SNS, and Step Functions, processing millions of events daily with 99.9% reliability",
				"Integrated AI/ML inference pipelines, RAG systems, and agents via REST and WebSocket APIs, enabling real-time image analysis, semantic search, and intelligent recommendations",
				"Provisioned analytics and data lake streaming pipelines with S3 event triggers, Redshift integration, and CloudWatch monitoring, automating data governance and warehouse operations"
			],
			tech: ["AWS SageMaker", "Terraform", "Lambda", "ECS", "S3", "EventBridge", "Redshift", "Node.js", "TypeScript", "Python", "WebSockets", "DynamoDB", "Pinecone"]
		},
		{
			title: "Lead Backend Engineer",
			company: "SpinWellness (Contract)",
			period: "11/2024 - 02/2025",
			location: "Remote",
			highlights: [
				"Architected and developed complete backend infrastructure using Next.js, Cloudflare Workers, and Terraform, enabling serverless deployment with zero-downtime capabilities",
				"Built RESTful APIs for waitlist management, user onboarding, and contact management, processing 10K+ requests daily with 99.95% uptime",
				"Implemented email notification systems using Resend API, automating user communications and reducing manual overhead by 90%",
				"Designed Infrastructure as Code using Terraform for Cloudflare Workers, KV storage, and D1 databases, ensuring consistent deployments across environments",
				"Developed admin dashboard APIs for waitlist management and analytics, enabling real-time insights into user growth metrics",
				"Optimized API response times to sub-100ms average latency through efficient database queries and caching strategies"
			],
			tech: ["Next.js", "TypeScript", "Cloudflare Workers", "Cloudflare D1", "Terraform", "Resend API", "Serverless Architecture"]
		},
		{
			title: "Software Engineer",
			company: "Access Bank PLC",
			period: "04/2023 - 03/2025",
			location: "Remote",
			highlights: [
				"Transformed backend architecture by implementing scalable microservices, improving system performance by 25% and reducing latency by 40% for 52M+ users",
				"Conducted design and code reviews, integrating network services across multiple platforms using SOAP and REST APIs (Safaricom, MPesa, RevPay), increasing system efficiency by 25%",
				"Proactively identified and drove architectural improvements, enhancing decision-making processes and reducing development time by 30%",
				"Optimized DevOps pipelines using AWS services, Docker, GitHub Actions, and Kubernetes, increasing deployment speed by 40% and reducing deployment failures by 50%",
				"Architected real-time data processing systems using Kafka and OLTP databases, handling millions of transactions daily with 99.99% reliability",
				"Developed Python automation scripts for operational tasks, reducing manual processing time by 60%"
			],
			tech: ["C#", "ASP.NET", ".NET Core", "Java", "Python", "AWS", "Docker", "Kubernetes", "Kafka", "PostgreSQL", "MySQL", "GitHub Actions", "TurboRepo"]
		},
		{
			title: "Undergraduate Tutor",
			company: "EdgeHill University",
			period: "10/2023 - 12/2023",
			location: "Ormskirk, UK",
			highlights: [
				"Conducted extracurricular sessions on programming and databases",
				"Provided one-on-one mentoring for complex technical concepts",
				"Assisted faculty in preparing learning materials and evaluating projects"
			],
			tech: ["Teaching", "Mentoring", "Database Design", "Programming"]
		},
		{
			title: "Lead Software Engineer",
			company: "GipperPay",
			period: "05/2022 - 04/2023",
			location: "Delaware, USA",
			highlights: [
				"Developed scalable authentication microservice enhancing security and UX",
				"Led cross-functional team of 7 engineers delivering cryptocurrency products",
				"Increased market reach by 50% and transaction volumes by 60%",
				"Reduced time to market by 20% through streamlined processes"
			],
			tech: [".NET", "C#", "JavaScript", "Python", "AWS", "Docker", "Microservices"]
		},
		{
			title: "Software Engineer, Backend",
			company: "Binance",
			period: "12/2021 - 12/2022",
			location: "Remote",
			highlights: [
				"Architected Cashlink P2P service processing $1.5M+ weekly transactions",
				"Improved transaction success rate by 15% and customer satisfaction by 25%",
				"Enhanced crypto social platform features, increasing user activity by 30%",
				"Collaborated across blockchain, backend, and frontend teams"
			],
			tech: ["Node.js", "TypeScript", "Java", "Spring Boot", "C#", "Docker", "Blockchain"]
		},
		{
			title: "Backend Software Engineer",
			company: "DevClusters",
			period: "02/2018 - 12/2021",
			location: "Remote",
			highlights: [
				"Developed and managed backend APIs for team networking",
				"Integrated various API providers enhancing functionality and UX",
				"Improved application performance by 20% through seamless integration",
				"Led major initiatives coordinating efforts across teams"
			],
			tech: ["Backend APIs", "System Integration", "Performance Optimization", "Team Leadership"]
		}
	];

	const skills = {
		languages: ["Java", "C#", "TypeScript", "JavaScript", "Python", "Rust", "Golang"],
		frameworks: ["Spring Boot", "ASP.NET Core", "NestJS", "React", "Next.js", "Node.js", "ExpressJS"],
		cloud: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CloudFormation", "SageMaker", "Cloudflare Workers"],
		databases: ["PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Redis", "Elasticsearch", "Pinecone", "Redshift"],
		devops: ["Git", "Jenkins", "Maven", "Gradle", "Ansible", "Vagrant", "CI/CD", "GitHub Actions"],
		concepts: ["Microservices", "Serverless", "TDD", "System Design", "Event-driven Architecture", "MLOps", "LLM Integration", "RAG Pipelines"]
	};

	return (
		<main className="scroll-container">
			{/* Hero Section */}
			<section className="min-h-screen flex items-center justify-center px-4 sm:px-6 scroll-section" style={{ background: 'var(--background)' }}>
				<div className="max-w-4xl mx-auto text-center">
					<div className="animate-fade-in">
						<div className="mb-8">
							<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 funky-heading capitalize">
								<span className="gradient-text">Babalola Opeyemi</span>
							</h1>
							<div className="h-8 mb-6">
								<p className="text-xl md:text-2xl font-mono" style={{ color: 'var(--muted)' }}>
									{typedText}<span className="animate-pulse">|</span>
								</p>
							</div>
							<p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8 funky-text" style={{ color: 'var(--muted)' }}>
								Senior Software Engineer. Building scalable systems, AI/ML infrastructure, and cloud-native solutions. Leading teams, mentoring engineers, and architecting high-performance systems.
							</p>
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
							<a
								href={getBlogUrl()}
								className="btn btn-secondary w-full sm:w-auto"
							>
								Read brainiac's blog
							</a>
							<a
								href="mailto:babaloladanielope@gmail.com"
								className="btn btn-secondary w-full sm:w-auto"
							>
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								Get In Touch
							</a>
						</div>

					</div>
				</div>
			</section>

			{/* About Section */}
			<section id="about" className="min-h-screen flex items-center px-4 sm:px-6 scroll-section" style={{ background: 'var(--background-secondary)' }}>
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 funky-heading gradient-text">
							about
						</h2>
					</div>

					<div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
						{/* Education & Stats Card */}
						<div className="space-y-6">
							<div className="about-card p-6">
								<h3 className="text-xl font-bold mb-4 font-mono gradient-text">Education</h3>
								<div className="space-y-4">
									<div className="p-4 glass rounded-lg">
										<h4 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>EdgeHill University, UK</h4>
										<p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Master's Degree in Computing (2024)</p>
									</div>
									<div className="p-4 glass rounded-lg">
										<h4 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>University of Ilorin, Nigeria</h4>
										<p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Bachelor's Degree (2016)</p>
									</div>
								</div>
							</div>

							<div className="about-card p-6">
								<h3 className="text-xl font-bold mb-4 font-mono gradient-text">Quick Stats</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center p-3 glass rounded-lg">
										<span className="text-sm" style={{ color: 'var(--muted)' }}>Experience</span>
										<span className="font-bold text-lg gradient-text">5+ Years</span>
									</div>
									<div className="flex justify-between items-center p-3 glass rounded-lg">
										<span className="text-sm" style={{ color: 'var(--muted)' }}>Users Impacted</span>
										<span className="font-bold text-lg gradient-text">52M+</span>
									</div>
									<div className="flex justify-between items-center p-3 glass rounded-lg">
										<span className="text-sm" style={{ color: 'var(--muted)' }}>Companies</span>
										<span className="font-bold text-lg gradient-text">6</span>
								</div>
									<div className="flex justify-between items-center p-3 glass rounded-lg">
										<span className="text-sm" style={{ color: 'var(--muted)' }}>Technologies</span>
										<span className="font-bold text-lg gradient-text">25+</span>
									</div>
								</div>
							</div>
						</div>

						{/* Fun Facts Card */}
						<div className="space-y-6">
							<div className="about-card p-6">
								<h3 className="text-xl font-bold mb-4 font-mono gradient-text">interests</h3>
								<div className="space-y-4">
									<div className="p-4 glass rounded-lg">
										<div className="flex items-start gap-3">
											<span className="text-lg mt-0.5">🍳</span>
											<div>
												<p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Cooking</p>
												<p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>love experimenting with flavors</p>
											</div>
										</div>
									</div>
									<div className="p-4 glass rounded-lg">
										<div className="flex items-start gap-3">
											<span className="text-lg mt-0.5">🎌</span>
											<div>
												<p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Anime</p>
												<p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>avid watcher</p>
											</div>
										</div>
									</div>
									<div className="p-4 glass rounded-lg">
										<div className="flex items-start gap-3">
											<span className="text-lg mt-0.5">📚</span>
											<div>
												<p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Epic Fantasy</p>
												<p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>favorites: Wheel of Time (Robert Jordan), The Demon Cycle (Peter V. Brett), The Name of the Wind (Patrick Rothfuss), Before They Are Hanged (Joe Abercrombie)</p>
											</div>
										</div>
									</div>
									<div className="p-4 glass rounded-lg">
										<div className="flex items-start gap-3">
											<span className="text-lg mt-0.5">🎹</span>
											<div>
												<p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Music</p>
												<p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>piano & guitar. used to be a music director directing a choir of over 300 choristers</p>
											</div>
										</div>
									</div>
									<div className="p-4 glass rounded-lg">
										<div className="flex items-start gap-3">
											<span className="text-lg mt-0.5">🎧</span>
											<div>
												<p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Audiophile</p>
												<p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>enjoys listening to music</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Experience Section */}
			<section id="experience" className="min-h-screen flex items-center px-4 sm:px-6 scroll-section" style={{ background: 'var(--background)' }}>
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 funky-heading gradient-text">
							experience
						</h2>
					</div>

					{/* Experience Carousel */}
					<div className="relative">
						{/* Navigation Arrows */}
						<button
							onClick={prevExperience}
							className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 glass rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
							aria-label="Previous experience"
						>
							<svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						<button
							onClick={nextExperience}
							className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 glass rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
							aria-label="Next experience"
						>
							<svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>

						{/* Experience Card */}
						<div className="mx-4">
							<div className="experience-card animate-fade-in">
								<div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
									<div className="mb-4 lg:mb-0 lg:flex-1">
										<h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono gradient-text mb-2">
											{experiences[currentExperienceIndex].title}
										</h3>
										<p className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
											{experiences[currentExperienceIndex].company}
										</p>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm font-mono" style={{ color: 'var(--muted)' }}>
											<span className="opacity-75">{experiences[currentExperienceIndex].period}</span>
											<span className="hidden sm:inline opacity-50">•</span>
											<span className="opacity-75">{experiences[currentExperienceIndex].location}</span>
										</div>
									</div>
								</div>

								<div className="mb-6">
									<h4 className="text-lg sm:text-xl font-semibold mb-3 font-mono gradient-text">Key Achievements</h4>
									<ul className="space-y-3 sm:space-y-4" style={{ color: 'var(--muted)' }}>
										{experiences[currentExperienceIndex].highlights.map((highlight, idx) => (
											<li key={idx} className="flex items-start gap-3 sm:gap-4 text-base sm:text-lg">
												<span className="text-[var(--accent)] mt-1 sm:mt-2 text-lg sm:text-xl">▶</span>
												<span className="leading-relaxed">{highlight}</span>
											</li>
										))}
									</ul>
								</div>

								{/* Removed Technologies Used here to avoid duplication with Skills section */}
							</div>
						</div>

						{/* Experience Indicators */}
						<div className="flex justify-center mt-8 space-x-2">
							{experiences.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentExperienceIndex(index)}
									className={`w-3 h-3 rounded-full transition-all duration-300 ${
										index === currentExperienceIndex 
											? 'bg-[var(--accent)] scale-125' 
											: 'bg-[var(--muted)] hover:bg-[var(--accent)]'
									}`}
									aria-label={`Go to experience ${index + 1}`}
								/>
								))}
							</div>

						{/* Experience Counter */}
						<div className="text-center mt-4">
							<span className="text-sm font-mono" style={{ color: 'var(--muted)' }}>
								{currentExperienceIndex + 1} of {experiences.length}
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Skills Section */}
			<section id="skills" className="min-h-screen flex items-center px-4 sm:px-6 scroll-section" style={{ background: 'var(--background-secondary)' }}>
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 funky-heading gradient-text">
							skills
						</h2>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{Object.entries(skills).map(([category, items], index) => (
							<div key={category} className="skill-card p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
								<div className="skill-icon">
									<span className="text-2xl">{getSkillIcon(category)}</span>
							</div>
								<h3 className="text-xl font-bold mb-4 font-mono gradient-text capitalize">
									{category}
								</h3>
								<div className="flex flex-wrap gap-2">
									{items.map((skill, skillIndex) => (
										<span 
											key={skill} 
											className="skill-tag"
											style={{ animationDelay: `${(index * 0.1) + (skillIndex * 0.05)}s` }}
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section id="contact" className="min-h-screen flex items-center px-4 sm:px-6 scroll-section" style={{ background: 'var(--background)' }}>
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 funky-heading gradient-text">
						let's connect
					</h2>

					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
						<a 
							href="mailto:babaloladanielope@gmail.com" 
							className="contact-card p-6"
						>
							<div className="text-3xl mb-4">📧</div>
							<h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>Email</h3>
							<p className="font-mono text-sm break-all" style={{ color: 'var(--muted)' }}>babaloladanielope@gmail.com</p>
						</a>

						<a 
							href="https://linkedin.com/in/babalola-opeyemi" 
							target="_blank"
							rel="noopener noreferrer"
							className="contact-card p-6"
						>
							<div className="text-3xl mb-4">💼</div>
							<h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>LinkedIn</h3>
							<p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>Babalola Opeyemi</p>
						</a>

						<a 
							href="https://medium.com/@babaloladanielope" 
							target="_blank"
							rel="noopener noreferrer"
							className="contact-card p-6"
						>
							<div className="text-3xl mb-4">📝</div>
							<h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>Medium</h3>
							<p className="font-mono text-sm break-all" style={{ color: 'var(--muted)' }}>@babaloladanielope</p>
						</a>

						<a 
							href="https://twitter.com/brainiac_ope" 
							target="_blank"
							rel="noopener noreferrer"
							className="contact-card p-6"
						>
							<div className="text-3xl mb-4">🐦</div>
							<h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>Twitter</h3>
							<p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>@brainiac_ope</p>
						</a>
					</div>

				</div>
			</section>
		</main>
	);
}