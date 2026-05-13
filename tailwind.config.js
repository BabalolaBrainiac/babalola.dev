/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-overlay': 'var(--bg-overlay)',
        'accent-primary': 'var(--accent-primary)',
        'accent-glow': 'var(--accent-glow)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-purple': 'var(--accent-purple)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
        'glass-border': 'var(--glass-border)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
