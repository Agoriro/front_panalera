import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9B7DB6',
          dark: '#7A5F99',
        },
        secondary: '#7CC4A4',
        accent: '#F4A97F',
        surface: {
          DEFAULT: '#FAFAF8',
          card: '#FFFFFF',
        },
        'text-base': '#2D2D3A',
        'text-muted': '#6B6B7B',
        'border-soft': '#E8E4F0',
        danger: '#E05252',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
