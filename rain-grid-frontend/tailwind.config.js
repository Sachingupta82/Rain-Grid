/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // SecureOne Primary Blue
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb', // Core action color
          700: '#1d4ed8',
        },
        // SecureOne Neutral Slate
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          400: '#94a3b8',
          500: '#64748b',
          900: '#0f172a', // Dark header/sidebar text
          950: '#020617', // Deepest background
        }
      },
      borderRadius: {
        '3xl': '1.5rem', // Used for SecureOne Cards
      },
      boxShadow: {
        'premium': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}