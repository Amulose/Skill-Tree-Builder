/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        panel: '#121212',
        border: '#2A2A2A',
        accent: '#6366F1', // Indigo
        accentHover: '#4F46E5',
        textMain: '#EDEDED',
        textMuted: '#A1A1AA',
        success: '#10B981', // Emerald
        locked: '#3F3F46', // Zinc
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}