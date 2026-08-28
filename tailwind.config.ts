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
          DEFAULT: '#8A0BD2',
          dark: '#5B0672',
        },
        secondary: '#5B0672',
        accent: '#D980F9',
        surface: {
          DEFAULT: '#FBF9FD',
          card: '#FFFFFF',
        },
        'text-base': '#2B1733',
        'text-muted': '#68566F',
        'border-soft': '#E2CEF6',
        danger: '#C63F4F',
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
