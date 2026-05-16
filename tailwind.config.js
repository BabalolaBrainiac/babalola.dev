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
        'text-primary': 'var(--text-primary)',
        'accent-primary': 'var(--accent-primary)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
