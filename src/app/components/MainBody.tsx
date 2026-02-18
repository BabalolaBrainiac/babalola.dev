'use client';

import React, { useState, useEffect } from 'react';
import { getBlogUrl } from '@/lib/urls';
import { 
  experiences, 
  skills, 
  getFeaturedProjects, 
  getAllProjects,
  type Project 
} from '../data/portfolio';

// Category icons for projects
const getProjectIcon = (category: Project['category']) => {
  const icons = {
    security: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    iac: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    ai: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    opensource: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  };
  return icons[category];
};

const getCategoryColor = (category: Project['category']) => {
  const colors = {
    security: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    iac: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    ai: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    opensource: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  };
  return colors[category];
};

const getCategoryLabel = (category: Project['category']) => {
  const labels = {
    security: 'Security',
    iac: 'Infrastructure',
    ai: 'AI/ML',
    opensource: 'Open Source',
  };
  return labels[category];
};

export default function MainBody() {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Software Engineer';
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const [activeProjectFilter, setActiveProjectFilter] = useState<Project['category'] | 'all'>('all');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const featuredProjects = getFeaturedProjects();
  const allProjects = getAllProjects();
  
  const filteredProjects = activeProjectFilter === 'all' 
    ? allProjects 
    : allProjects.filter(p => p.category === activeProjectFilter);

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

  const currentExperience = experiences[currentExperienceIndex];

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
                Software Engineer. Building scalable systems, AI/ML infrastructure, and cloud-native solutions. Leading teams, mentoring engineers, and architecting high-performance systems.
              </p>
            </div>

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
                        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>favorites: Wheel of Time, The Demon Cycle, The Name of the Wind, Before They Are Hanged</p>
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

      {/* Experience Section with Projects */}
      <section id="experience" className="min-h-screen flex items-center px-4 sm:px-6 scroll-section py-20" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 funky-heading gradient-text">
              experience
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
              where i've worked and what i've built
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Experience List - Left Side */}
            <div className="lg:col-span-4 space-y-2">
              {experiences.map((exp, index) => (
                <button
                  key={exp.id}
                  onClick={() => setCurrentExperienceIndex(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                    index === currentExperienceIndex
                      ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/30'
                      : 'hover:bg-[var(--glass-bg)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${
                        index === currentExperienceIndex ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'
                      }`}>
                        {exp.company}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>{exp.title}</p>
                    </div>
                    <span className="text-xs font-mono opacity-50">{exp.period.split(' - ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Experience Details - Right Side */}
            <div className="lg:col-span-8">
              <div className="experience-card animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-mono gradient-text mb-1">
                      {currentExperience.title}
                    </h3>
                    <p className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                      {currentExperience.company}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm font-mono" style={{ color: 'var(--muted)' }}>
                      <span>{currentExperience.period}</span>
                      <span className="opacity-50">•</span>
                      <span>{currentExperience.location}</span>
                      <span className="opacity-50">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        currentExperience.type === 'contract' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : currentExperience.type === 'parttime'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {currentExperience.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-3 font-mono gradient-text">Key Achievements</h4>
                  <ul className="space-y-3" style={{ color: 'var(--muted)' }}>
                    {currentExperience.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-[var(--accent)] mt-1">▶</span>
                        <span className="leading-relaxed text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold mb-2 font-mono" style={{ color: 'var(--muted)' }}>Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentExperience.tech.map((tech) => (
                      <span key={tech} className="project-tag text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects Built at this Role */}
                {currentExperience.projects && currentExperience.projects.length > 0 && (
                  <div className="border-t border-[var(--glass-border)] pt-6">
                    <h4 className="text-lg font-semibold mb-4 font-mono gradient-text flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Projects Built
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {currentExperience.projects.map((project) => (
                        <div 
                          key={project.id}
                          className="p-4 glass rounded-lg hover:border-[var(--accent)]/30 transition-all duration-300 group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-[var(--accent)] group-hover:text-[var(--accent)] transition-colors">
                              {project.name}
                            </h5>
                            {getProjectIcon(project.category)}
                          </div>
                          <p className="text-xs mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                            {project.tagline}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {project.tech.slice(0, 3).map((t) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--glass-bg)]" style={{ color: 'var(--muted)' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {experiences.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentExperienceIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentExperienceIndex 
                        ? 'bg-[var(--accent)] w-6' 
                        : 'bg-[var(--muted)] hover:bg-[var(--accent)]'
                    }`}
                    aria-label={`Go to experience ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section - Bento Grid */}
      <section id="projects" className="min-h-screen flex items-center px-4 sm:px-6 scroll-section py-20" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 funky-heading gradient-text">
              projects
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--muted)' }}>
              building tools that solve real problems
            </p>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(['all', 'security', 'iac', 'ai', 'opensource'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveProjectFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeProjectFilter === filter
                      ? 'bg-[var(--accent)] text-white'
                      : 'glass hover:border-[var(--accent)]/30'
                  }`}
                >
                  {filter === 'all' ? 'All Projects' : getCategoryLabel(filter)}
                </button>
              ))}
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const isExpanded = expandedProject === project.id;
              const isFeatured = project.featured;
              
              return (
                <div
                  key={project.id}
                  className={`project-card group relative overflow-hidden transition-all duration-500 ${
                    isFeatured && activeProjectFilter === 'all' ? 'md:col-span-2 lg:col-span-1' : ''
                  } ${isExpanded ? 'row-span-2' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(project.category)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--glass-bg)]" style={{ color: 'var(--muted)' }}>
                            {getCategoryLabel(project.category)}
                          </span>
                          {project.featured && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold font-mono gradient-text">
                          {project.name}
                        </h3>
                        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>
                          {project.tagline}
                        </p>
                      </div>
                      <div className="glass p-2 rounded-lg text-[var(--accent)]">
                        {getProjectIcon(project.category)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-4 flex-grow" style={{ color: 'var(--muted)' }}>
                      {isExpanded ? project.fullDescription : project.description}
                    </p>

                    {/* Stats (if featured) */}
                    {project.stats && (
                      <div className="flex gap-4 mb-4">
                        {project.stats.map((stat) => (
                          <div key={stat.label} className="text-center">
                            <div className="text-lg font-bold gradient-text">{stat.value}</div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech) => (
                        <span key={tech} className="project-tag text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--glass-border)]">
                      {project.links.website && (
                        <a
                          href={project.links.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary text-sm flex-1 text-center"
                        >
                          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Website
                        </a>
                      )}
                      {project.links.github && (
                        <a
                          href={project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex-1 text-center"
                        >
                          <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </a>
                      )}
                      <button
                        onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                        className="btn btn-secondary text-sm px-3"
                        title={isExpanded ? 'Show less' : 'Show more'}
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="min-h-screen flex items-center px-4 sm:px-6 scroll-section" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 funky-heading gradient-text">
              skills
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div key={skillGroup.category} className="skill-card p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="skill-icon">
                  <span className="text-2xl">{skillGroup.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-4 font-mono gradient-text capitalize">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill, skillIndex) => (
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
