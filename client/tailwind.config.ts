import type { Config } from 'tailwindcss';

// Design tokens (sage-and-paper nature palette, display serif + sans body)
// land in Phase 1 when the wireframe's fincava-ds tokens are defined for
// real. This is intentionally a stock Tailwind config for now.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
