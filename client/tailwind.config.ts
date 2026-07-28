import type { Config } from 'tailwindcss';

// Maps the --fc-* custom properties in src/styles/tokens.css onto Tailwind
// utilities (bg-fc-sage, font-display, shadow-fc-1, etc.) so components
// don't need to write raw var(--fc-*) everywhere.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'fc-paper': 'var(--fc-paper)',
        'fc-paper-2': 'var(--fc-paper-2)',
        'fc-white': 'var(--fc-white)',
        'fc-ink': 'var(--fc-ink)',
        'fc-ink-2': 'var(--fc-ink-2)',
        'fc-ink-3': 'var(--fc-ink-3)',
        'fc-line': 'var(--fc-line)',
        'fc-line-soft': 'var(--fc-line-soft)',
        'fc-border-strong': 'var(--fc-border-strong)',
        'fc-sage': 'var(--fc-sage)',
        'fc-sage-deep': 'var(--fc-sage-deep)',
        'fc-sage-soft': 'var(--fc-sage-soft)',
        'fc-brick': 'var(--fc-brick)',
        'fc-caramel': 'var(--fc-caramel)',
        'fc-peach': 'var(--fc-peach)',
        'fc-warning-soft': 'var(--fc-warning-soft)',
      },
      fontFamily: {
        display: ['var(--fc-font-display)'],
        sans: ['var(--fc-font-sans)'],
        mono: ['var(--fc-font-mono)'],
      },
      borderRadius: {
        'fc-md': 'var(--fc-radius-md)',
        'fc-lg': 'var(--fc-radius-lg)',
        'fc-pill': 'var(--fc-radius-pill)',
      },
      boxShadow: {
        'fc-1': 'var(--fc-shadow-1)',
        'fc-3': 'var(--fc-shadow-3)',
      },
    },
  },
  plugins: [],
} satisfies Config;
