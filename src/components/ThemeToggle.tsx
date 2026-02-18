'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle flex items-center"
      aria-label="Toggle theme"
    >
      <div className="theme-toggle-thumb"></div>
    </button>
  )
}
