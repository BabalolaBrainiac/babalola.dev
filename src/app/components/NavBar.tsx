"use client";

import React, { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#about",      label: "about" },
  { href: "#experience", label: "experience" },
  { href: "#projects",   label: "projects" },
  { href: "https://learning.babalola.dev", label: "learning" },
  { href: "#skills",     label: "skills" },
  { href: "#opensource", label: "open_source" },
  { href: "#contact",    label: "contact" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-200 font-mono ${
        scrolled
          ? "bg-black border-b border-[#222]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="text-[#e8a000] text-sm font-bold tracking-tight group-hover:opacity-80 transition-opacity">
            babalola.dev
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("https://") ? "_blank" : undefined}
              rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
              className="text-[#888] hover:text-[#e8a000] transition-colors text-xs tracking-wide"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop social + blog */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://blog.babalola.dev"
            className="text-[#888] hover:text-[#e8a000] transition-colors text-xs"
          >
            blog -&gt;
          </a>
          <a
            href="https://github.com/BabalolaBrainiac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888] hover:text-[#e8a000] transition-colors"
            aria-label="GitHub"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/babalola-opeyemi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888] hover:text-[#e8a000] transition-colors"
            aria-label="LinkedIn"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#888] hover:text-[#e8a000] transition-colors p-1"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-b border-[#222]">
          <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target={href.startsWith("https://") ? "_blank" : undefined}
                rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
                className="text-[#888] hover:text-[#e8a000] transition-colors text-xs py-2 border-b border-[#222] last:border-0"
              >
                <span className="text-[#e8a000] mr-2">&gt;</span>{label}
              </a>
            ))}
            <a
              href="https://blog.babalola.dev"
              className="text-[#888] hover:text-[#e8a000] transition-colors text-xs py-2 mt-1"
            >
              <span className="text-[#e8a000] mr-2">&gt;</span>blog -&gt;
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
