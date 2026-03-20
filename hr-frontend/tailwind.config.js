/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f4ff',
          100: '#b3deff',
          200: '#80c8ff',
          300: '#4db2ff',
          400: '#1a9cff',
          500: '#0ea5ff',
          600: '#0b78d1',
          700: '#085ba3',
          800: '#053e75',
          900: '#022147',
        },
        surface: '#ffffff',
        panel: '#f6f6f8',
        muted: '#9AA0A6',
        darkbg: '#393939',
        darkpanel: '#2d2d2d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        'popup': '0 8px 30px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'primary': 'cubic-bezier(.22,.9,.33,1)',
        'soft': 'cubic-bezier(.25,.46,.45,.94)',
        'elastic': 'cubic-bezier(.5,1.6,.64,1)',
      },
    },
  },
  plugins: [],
}

