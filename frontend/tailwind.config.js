/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1E3A5F',
          dark:    '#0E1328',
          light:   '#2B4E80',
        },
        accent: {
          DEFAULT: '#1A73E8',
          light:   '#428EF5',
        },
        teal: {
          DEFAULT: '#00897B',
          light:   '#4DB6AC',
        },
        amber:  { DEFAULT: '#F9AB00' },
        coral:  { DEFAULT: '#E84A4A' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -1px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
}

