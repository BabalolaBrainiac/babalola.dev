'use client';

import React, { useState, useEffect } from 'react';
import { getBlogUrl } from '@/lib/urls';
import {
  experiences,
  skills,
  openSourceContributions,
  getAllProjects,
  type Project
} from '../data/portfolio';

const CATEGORY_LABELS: Record<Project['category'], string> = {
  security:   'Security',
  iac:        'Infrastructure',
  ai:         'AI / ML',
  opensource: 'Open Source',
  agent:      'AI Agents',
  health:     'Health Tech',
};

const ROLES = [
  'Senior Software Engineer',
  'Platform Engineer',
  'AI Systems Architect',
  'MLOps Community Lead',
];

export default function MainBody() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleFade,  setRoleFade]  = useState(true);
  const [activeExp, setActiveExp] = useState(0);
  const [activeFilter, setActiveFilter] = useState<Project['category'] | 'all'>('all');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const allProjects = getAllProjects();
  const filtered = activeFilter === 'all'
    ? allProjects
    : allProjects.filter(p => p.category === activeFilter);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleFade(false);
      setTimeout(() => {
        setRoleIndex(i => (i + 1) % ROLES.length);
        setRoleFade(true);
      }, 250);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const exp = experiences[activeExp];

  return (
    <main className="font-mono bg-black">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-10 pt-16 text-center">
        <div className="max-w-3xl w-full py-20 flex flex-col items-center">

          <p className="text-[10px] text-[#333] mb-10 tracking-[0.2em] uppercase">
            <span className="text-[#e8a000]">&gt;</span>&nbsp;platform engineering · ai infrastructure · distributed systems
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#d0ccc4] leading-none tracking-tight mb-5">
            BABALOLA<br />OPEYEMI
          </h1>

          <div className="flex items-center justify-center gap-3 mb-8 h-7">
            <span className="text-[#e8a000] font-light select-none text-xl leading-none">_</span>
            <p
              className="text-lg text-[#888] transition-opacity duration-200"
              style={{ opacity: roleFade ? 1 : 0 }}
            >
              {ROLES[roleIndex]}
            </p>
          </div>

          <div className="flex items-center justify-center gap-5 text-[10px] text-[#333] mb-10 tracking-widest uppercase">
            <span>6+ years</span>
            <span>.</span>
            <span>52M+ users</span>
            <span>.</span>
            <span>MLOps Community Liverpool</span>
          </div>

          <p className="text-sm text-[#666] max-w-xl leading-relaxed mb-12">
            I build production systems where backend architecture, cloud infrastructure, and AI workflows meet.
            Current work spans LLM backends, MLOps infrastructure, secure developer tools, and agent interoperability.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="#projects" className="btn btn-primary">view work</a>
            <a href="mailto:babaloladanielope@gmail.com" className="btn btn-secondary">get in touch</a>
            <a href="https://learning.babalola.dev" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">learning</a>
            <a href={getBlogUrl()} className="btn btn-ghost">blog -&gt;</a>
          </div>

          <p className="mt-20 text-[10px] text-[#222] tracking-[0.2em] uppercase">
            scroll
          </p>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────── */}
      <section id="about" className="py-28 px-5 sm:px-10 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-2">// 01.</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#d0ccc4] mb-16">about</h2>

          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              {/* Education */}
              <div className="about-card p-6">
                <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-5">Education</p>
                <div className="space-y-5">
                  <div className="border-l-2 border-[#e8a000] pl-4">
                    <p className="text-sm text-[#d0ccc4] font-semibold">EdgeHill University, UK</p>
                    <p className="text-xs text-[#888] mt-0.5">MSc Computing · 2024</p>
                  </div>
                  <div className="border-l border-[#222] pl-4">
                    <p className="text-sm text-[#d0ccc4] font-semibold">University of Ilorin, Nigeria</p>
                    <p className="text-xs text-[#888] mt-0.5">BSc · 2016</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="about-card p-6">
                <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-4">Quick Stats</p>
                <div className="space-y-0">
                  {[
                    { k: 'Experience',     v: '6+ years' },
                    { k: 'Users Impacted', v: '52M+'     },
                    { k: 'Companies',      v: '6'        },
                    { k: 'Technologies',   v: '25+'      },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex justify-between text-xs py-2.5 border-b border-[#222] last:border-0">
                      <span className="text-[#888]">{k}</span>
                      <span className="text-[#e8a000] font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="about-card p-6">
              <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-5">Interests</p>
              <div className="space-y-0">
                {[
                  { icon: '>', title: 'Cooking',      detail: 'love experimenting with flavors' },
                  { icon: '>', title: 'Anime',        detail: 'avid watcher' },
                  { icon: '>', title: 'Epic Fantasy', detail: 'Wheel of Time · Demon Cycle · Name of the Wind' },
                  { icon: '>', title: 'Music',        detail: 'piano & guitar · former choir director, 300+ choristers' },
                  { icon: '>', title: 'Audiophile',   detail: 'serious listener, serious headphones' },
                ].map(({ icon, title, detail }) => (
                  <div key={title} className="flex gap-3 py-3 border-b border-[#222] last:border-0">
                    <span className="text-xs w-4 shrink-0 leading-tight mt-0.5 text-[#e8a000]">{icon}</span>
                    <div>
                      <p className="text-xs text-[#d0ccc4] font-semibold">{title}</p>
                      <p className="text-[11px] text-[#666] mt-0.5 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ────────────────────────────────────────────── */}
      <section id="experience" className="py-28 px-5 sm:px-10 bg-[#111] border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-2">// 02.</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#d0ccc4] mb-16">experience</h2>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Company list */}
            <div className="lg:col-span-4 space-y-1">
              {experiences.map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => setActiveExp(i)}
                  className={`w-full text-left px-4 py-3 border-l transition-all duration-150 ${
                    i === activeExp
                      ? 'border-l-[#e8a000] bg-[rgba(232,160,0,0.04)] text-[#e8a000]'
                      : 'border-l-[#222] text-[#888] hover:border-l-[#333] hover:text-[#d0ccc4]'
                  }`}
                >
                  <p className="text-xs font-semibold tracking-wide">{e.company}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{e.title}</p>
                </button>
              ))}
            </div>

            {/* Detail */}
            <div className="lg:col-span-8 experience-card">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#d0ccc4]">{exp.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#888]">
                  <span className="text-[#e8a000]">{exp.company}</span>
                  <span className="text-[#222]">·</span>
                  <span>{exp.period}</span>
                  <span className="text-[#222]">·</span>
                  <span>{exp.location}</span>
                  <span className={`ml-1 px-1.5 py-0.5 text-[9px] uppercase tracking-widest border ${
                    exp.type === 'contract'
                      ? 'border-yellow-700/40 text-yellow-600'
                      : exp.type === 'parttime'
                      ? 'border-blue-900/40 text-blue-500'
                      : 'border-[#222] text-[#555]'
                  }`}>{exp.type}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-3">Key Achievements</p>
                <ul className="space-y-2">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[#888] leading-relaxed">
                      <span className="text-[#e8a000] shrink-0 mt-0.5">&gt;</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-5">
                <p className="text-[10px] text-[#333] uppercase tracking-widest mb-2">Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {exp.tech.map(t => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>
              </div>

              {exp.projects && exp.projects.length > 0 && (
                <div className="border-t border-[#222] pt-5">
                  <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-3">Projects Built</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {exp.projects.map(p => (
                      <div key={p.id} className="border-l border-[#222] p-3 hover:border-l-[#333] transition-colors">
                        <p className="text-xs font-semibold text-[#d0ccc4] mb-0.5">{p.name}</p>
                        <p className="text-[10px] text-[#e8a000] mb-1.5">{p.tagline}</p>
                        <p className="text-[10px] text-[#555] leading-relaxed mb-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {p.tech.slice(0, 3).map(t => (
                            <span key={t} className="text-[9px] border border-[#222] px-1.5 py-0.5 text-[#333]">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ──────────────────────────────────────────────── */}
      <section id="projects" className="py-28 px-5 sm:px-10 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-2">// 03.</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#d0ccc4] mb-3">projects</h2>
          <p className="text-sm text-[#666] mb-10">building tools that solve real problems</p>

          <div className="flex flex-wrap gap-2 mb-10">
            {(['all', 'agent', 'ai', 'security', 'iac', 'health', 'opensource'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-[10px] uppercase tracking-widest px-3 py-1.5 transition-all duration-150 ${
                  activeFilter === f
                    ? 'text-[#e8a000] underline underline-offset-4'
                    : 'text-[#555] hover:text-[#888]'
                }`}
              >
                {f === 'all' ? 'all' : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(project => {
              const isExpanded = expandedProject === project.id;
              return (
                <div key={project.id} className="project-card flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="text-[9px] uppercase tracking-widest text-[#333] border border-[#222] px-1.5 py-0.5">
                          {CATEGORY_LABELS[project.category]}
                        </span>
                        {project.featured && (
                          <span className="text-[9px] uppercase tracking-widest text-[#e8a000] border border-[rgba(232,160,0,0.3)] px-1.5 py-0.5">
                            featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#d0ccc4]">{project.name}</h3>
                      <p className="text-[11px] text-[#e8a000] mt-0.5">{project.tagline}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#666] leading-relaxed mb-3 flex-grow">
                    {isExpanded ? project.fullDescription : project.description}
                  </p>

                  {project.stats && (
                    <div className="flex gap-5 mb-3 py-2.5 border-t border-b border-[#222]">
                      {project.stats.map(s => (
                        <div key={s.label}>
                          <p className="text-sm font-bold text-[#e8a000]">{s.value}</p>
                          <p className="text-[9px] uppercase tracking-widest text-[#333]">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tech.map(t => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#222]">
                    {project.links.website && (
                      <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex-1 text-center">
                        website
                      </a>
                    )}
                    {project.links.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1 text-center">
                        github
                      </a>
                    )}
                    <button
                      onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      className="btn btn-ghost px-3"
                      title={isExpanded ? 'show less' : 'show more'}
                    >
                      {isExpanded ? '[-]' : '[+]'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SKILLS ────────────────────────────────────────────────── */}
      <section id="skills" className="py-28 px-5 sm:px-10 bg-[#111] border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-2">// 04.</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#d0ccc4] mb-16">skills</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map(group => (
              <div key={group.category} className="skill-card">
                <div className="skill-icon">{group.category}</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {group.items.map(item => (
                    <span key={item} className="skill-tag">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE ───────────────────────────────────────────── */}
      <section id="opensource" className="py-28 px-5 sm:px-10 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-2">// 05.</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#d0ccc4] mb-3">open source</h2>
          <p className="text-sm text-[#666] mb-16">contributing to the ecosystem and building communities</p>

          <div className="grid md:grid-cols-2 gap-5">
            {openSourceContributions.map(c => (
              <div key={c.organization} className="opensource-card">
                <h3 className="text-base font-bold text-[#d0ccc4]">{c.organization}</h3>
                <p className="text-xs text-[#e8a000] mt-0.5 mb-4">{c.role}</p>
                <p className="text-xs text-[#666] leading-relaxed mb-5">{c.description}</p>
                <ul className="space-y-2 mb-5">
                  {c.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[#888] leading-relaxed">
                      <span className="text-[#e8a000] shrink-0 mt-0.5">&gt;</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                {c.links?.website && (
                  <a
                    href={c.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-widest text-[#e8a000] hover:underline"
                  >
                    learn more -&gt;
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────── */}
      <section id="contact" className="py-28 px-5 sm:px-10 bg-[#111] border-t border-[#222]">
        <div className="max-w-4xl mx-auto">
          <p className="section-label mb-2">// 06.</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#d0ccc4] mb-3">let's connect</h2>
          <p className="text-sm text-[#666] mb-14">want to collaborate, hire, or just talk tech?</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { href: 'mailto:babaloladanielope@gmail.com',        label: 'Email',    sub: 'babaloladanielope\n@gmail.com' },
              { href: 'https://linkedin.com/in/babalola-opeyemi', label: 'LinkedIn', sub: 'Babalola Opeyemi'               },
              { href: 'https://github.com/BabalolaBrainiac',      label: 'GitHub',   sub: '@BabalolaBrainiac'              },
            ].map(({ href, label, sub }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="contact-card group"
              >
                <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-3">{label}</p>
                <p className="text-xs text-[#888] leading-relaxed whitespace-pre-line">{sub}</p>
                <p className="text-[10px] text-[#222] group-hover:text-[#e8a000] mt-4 transition-colors">-&gt;</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="py-8 px-5 sm:px-10 border-t border-[#222]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-[#222] tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Babalola Opeyemi
          </p>
          <p className="text-[10px] text-[#222] tracking-widest uppercase">
            built with Next.js · deployed on Vercel
          </p>
        </div>
      </footer>

    </main>
  );
}
