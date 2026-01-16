/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3B82F6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        sidebar: '#1E293B',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}