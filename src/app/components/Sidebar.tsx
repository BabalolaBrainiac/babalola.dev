'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getBlogUrl } from '@/lib/urls';

const NAV = [
  { label: 'home',        href: '/' },
  { label: 'about',       href: '#about' },
  { label: 'experience',  href: '#experience' },
  { label: 'projects',    href: '#projects' },
  { label: 'skills',      href: '#skills' },
  { label: 'open_source', href: '#opensource' },
  { label: 'contact',     href: '#contact' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`fixed left-0 top-0 h-full z-50 hidden md:flex flex-col
        bg-[#0a0a0a] border-r border-[#1e1e1e] transition-all duration-200 ease-in-out font-mono
        ${expanded ? 'w-52' : 'w-14'}`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#1e1e1e] overflow-hidden shrink-0">
        <span className="text-[#e8a000] font-bold text-sm shrink-0">B</span>
      </div>

      {/* Nav links */}
      <div className="flex-1 flex flex-col py-4 overflow-hidden">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center h-10 px-4 text-[#555555] hover:text-[#e8a000] hover:bg-[rgba(232,160,0,0.04)] transition-all duration-150 group overflow-hidden"
          >
            <span className="text-[#2a2a2a] group-hover:text-[#e8a000] text-xs shrink-0 transition-colors">›</span>
            {expanded && (
              <span className="ml-3 text-xs whitespace-nowrap tracking-wide">{item.label}</span>
            )}
          </Link>
        ))}

        <div className="my-3 border-t border-[#1e1e1e] mx-4" />

        <a
          href={getBlogUrl()}
          className="flex items-center h-10 px-4 text-[#555555] hover:text-[#e8a000] hover:bg-[rgba(232,160,0,0.04)] transition-all duration-150 group overflow-hidden"
        >
          <span className="text-[#2a2a2a] group-hover:text-[#e8a000] text-xs shrink-0 transition-colors">↗</span>
          {expanded && (
            <span className="ml-3 text-xs whitespace-nowrap tracking-wide">blog</span>
          )}
        </a>

        <Link
          href="/brainiac"
          className="flex items-center h-10 px-4 text-[#555555] hover:text-[#e8a000] hover:bg-[rgba(232,160,0,0.04)] transition-all duration-150 group overflow-hidden"
        >
          <span className="text-[#2a2a2a] group-hover:text-[#e8a000] text-xs shrink-0 transition-colors">⚙</span>
          {expanded && (
            <span className="ml-3 text-xs whitespace-nowrap tracking-wide">brainiac</span>
          )}
        </Link>
      </div>

      {/* Footer */}
      {expanded && (
        <div className="px-4 py-4 border-t border-[#1e1e1e]">
          <p className="text-[9px] text-[#2a2a2a] tracking-widest uppercase">v2.0</p>
        </div>
      )}
    </nav>
  );
}
