"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from '@/contexts/ThemeContext';

export default function NavBar() {
	const { theme, toggleTheme } = useTheme();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		// Handle scroll effect
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
			isScrolled ? "glass" : "bg-transparent"
		}`}>
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
				<div className="flex justify-between items-center">
					{/* Logo */}
					<div className="flex items-center space-x-3">
						<img 
							src="/logo.svg" 
							alt="Babalola Logo" 
							className="w-8 h-8 sm:w-10 sm:h-10"
						/>
						<span className="text-lg sm:text-xl font-bold funky-heading text-[var(--foreground)]">
							babalola
						</span>
					</div>

					{/* Desktop Navigation Links */}
					<div className="hidden md:flex items-center space-x-8">
						<a href="#about" className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm">
							about()
						</a>
						<a href="#experience" className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm">
							experience()
						</a>
						<a href="#skills" className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm">
							skills()
						</a>
						<a href="#contact" className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm">
							connect()
						</a>
					</div>

					{/* Desktop Theme Toggle & Social Links */}
					<div className="hidden md:flex items-center space-x-4">
						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className="theme-toggle flex items-center"
							aria-label="Toggle theme"
						>
							<div className="theme-toggle-thumb"></div>
						</button>

						{/* Social Links */}
						<a
							href="https://github.com/BabalolaBrainiac"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 p-2 rounded-lg hover:bg-[var(--glass-bg)]"
							aria-label="GitHub"
						>
							<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
							</svg>
						</a>
						<a
							href="https://linkedin.com/in/babalola-opeyemi"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 p-2 rounded-lg hover:bg-[var(--glass-bg)]"
							aria-label="LinkedIn"
						>
							<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
							</svg>
						</a>
						<a
							href="https://twitter.com/brainiac_ope"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 p-2 rounded-lg hover:bg-[var(--glass-bg)]"
							aria-label="Twitter"
						>
							<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
								<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
							</svg>
						</a>
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center space-x-3">
						<button
							onClick={toggleTheme}
							className="theme-toggle flex items-center"
							aria-label="Toggle theme"
						>
							<div className="theme-toggle-thumb"></div>
						</button>
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="text-[var(--foreground)] p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
							aria-label="Toggle mobile menu"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{isMobileMenuOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden mt-4 py-4 glass-card rounded-lg">
						<div className="flex flex-col space-y-4 px-4">
							<a 
								href="#about" 
								className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm py-2"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								about()
							</a>
							<a 
								href="#experience" 
								className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm py-2"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								experience()
							</a>
							<a 
								href="#skills" 
								className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm py-2"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								skills()
							</a>
							<a 
								href="#contact" 
								className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono text-sm py-2"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								connect()
							</a>
							<div className="flex items-center space-x-4 pt-4 border-t border-[var(--glass-border)]">
								<a
									href="https://github.com/BabalolaBrainiac"
									target="_blank"
									rel="noopener noreferrer"
									className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 p-2 rounded-lg hover:bg-[var(--glass-bg)]"
									aria-label="GitHub"
								>
									<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
									</svg>
								</a>
								<a
									href="https://linkedin.com/in/babalola-opeyemi"
									target="_blank"
									rel="noopener noreferrer"
									className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 p-2 rounded-lg hover:bg-[var(--glass-bg)]"
									aria-label="LinkedIn"
								>
									<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
									</svg>
								</a>
								<a
									href="https://medium.com/@babaloladanielope"
									target="_blank"
									rel="noopener noreferrer"
									className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 p-2 rounded-lg hover:bg-[var(--glass-bg)]"
									aria-label="Medium"
								>
									<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
										<path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z"/>
									</svg>
								</a>
								<a
									href="https://twitter.com/brainiac_ope"
									target="_blank"
									rel="noopener noreferrer"
									className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 p-2 rounded-lg hover:bg-[var(--glass-bg)]"
									aria-label="Twitter"
								>
									<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
										<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
									</svg>
								</a>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}