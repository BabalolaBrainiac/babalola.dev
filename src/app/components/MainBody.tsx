'use client';

import React, { useState, useEffect } from 'react';
import { getBlogUrl } from '@/lib/urls';

export default function MainBody() {
	const [typedText, setTypedText] = useState('');
	const fullText = 'Software Engineer';
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
			title: "Software Engineer",
			company: "HeySavi LTD",
			period: "03/2025 - Present",
			location: "Remote",
			highlights: [
				"Designed organization-wide AWS access management using Infrastructure as Code (Terraform)",
				"Developing LLM powered core chat backend service with Sagemaker integration",
				"Built robust, event-driven data pipelines with AWS Lambda, S3, SQS, and StepFunctions",
				"Integrated AI/ML inference pipelines and agents via REST and WebSocket APIs",
				"Provisioned analytics and data lake streaming pipelines with real-time S3 triggers"
			],
			tech: ["AWS", "Terraform", "Lambda", "Sagemaker", "S3", "SQS", "SNS", "StepFunctions", "Python", "Bash"]
		},
		{
			title: "Senior Software Engineer",
			company: "Access Bank PLC",
			period: "04/2023 - Present",
			location: "Remote",
			highlights: [
				"Led backend engineering for Access More banking app servicing the South African market with 2M+ users",
				"Actively developed and implemented comprehensive core banking services for South Africa including customer identification, verification, and transaction processing",
				"Built employee management and bill payment systems with real-time processing capabilities for South African operations",
				"Developed new onboarding and KYC certification system compliant with South African banking laws",
				"Architected back office solutions for South Africa's core banking service infrastructure",
				"Led backend transformation for Primus Plus serving 52M+ clients across Africa",
				"Increased system efficiency by 25% through microservice architecture",
				"Reduced development time by 30% through process optimization by developing custom scripts and rewriting the CI/CD pipeline to use an event-based mode of deployment to the bank's remote servers",
				"Improved deployment speed by 40% using AWS, Docker, and Kubernetes",
				"Managed real-time data processing with Kafka and OLTP systems"
			],
			tech: ["C#", ".NET", "AWS", "Docker", "Kubernetes", "Kafka", "Python", "GitHub Actions"]
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
		cloud: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CloudFormation"],
		databases: ["PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Redis", "Elasticsearch"],
		devops: ["Git", "Jenkins", "Maven", "Gradle", "Ansible", "Vagrant", "CI/CD"],
		concepts: ["Microservices", "Serverless", "TDD", "System Design", "Event-driven Architecture"]
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
							<p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8 funky-text" style={{ color: 'var(--muted)' }}>
								Experienced Software Engineer specializing in backend development, cloud/ML infrastructure, and DevOps automation. Living in the UK and available for remote work. 5+ years building scalable systems for banks, fintech, ecommerce, and AI/ML startups.<br/><br/>
								Expert in AWS, microservices, Python, C#, Java, Node.js, TypeScript, JavaScript, PostgreSQL, Terraform, Kubernetes, and Docker. Proven track record delivering enterprise solutions for Access Bank (52M+ users), Binance ($1.5M+ weekly transactions), and leading AI/ML infrastructure projects.
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
					<div className="text-center mb-16">
						<h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 funky-heading gradient-text">
							about
						</h2>
					</div>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main About Card */}
						<div className="lg:col-span-2">
							<div className="about-card p-8 h-full">
								<h3 className="text-2xl font-bold mb-6 font-mono gradient-text">Professional Journey</h3>
								<div className="space-y-6">
									<p className="text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
										Highly skilled and results-driven Software Engineer with over 5 years of experience designing, 
										developing, and deploying secure, scalable systems across fintech, enterprise, and AI/ML domains.
									</p>
									<p className="text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
										Proficient in C#, ASP.Net, Java, NodeJS, Spring Boot, JavaScript, TypeScript, and Python, 
										with expertise in DevOps technologies like AWS, GCP, Azure DevOps, Docker, Terraform, and ML Ops.
									</p>
									<p className="text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
										Adept at communicating complex technical concepts to diverse stakeholders and resolving 
										challenges efficiently. Currently learning and researching Machine Learning Operations (ML Ops) 
										to bridge the gap between data science and production systems.
									</p>
									<div className="mt-8 p-6 glass rounded-xl">
										<h4 className="text-lg font-semibold mb-3 font-mono gradient-text">Current Focus</h4>
										<p className="text-base" style={{ color: 'var(--muted)' }}>
											Committed to continuous learning and leveraging emerging technologies to deliver innovative solutions 
											that make a real impact on millions of users worldwide.
										</p>
									</div>
								</div>
							</div>
						</div>

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