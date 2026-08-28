/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a1a',
          surface: '#0f1729',
          card: '#1a2744',
          border: '#1e3a5f',
          cyan: '#00e5ff',
          green: '#00ff9d',
          purple: '#7c3aed',
          gold: '#ffd700',
          red: '#ff4444',
          orange: '#ff8c00',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 157, 0.3)',
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.3)',
        'neon-red': '0 0 20px rgba(255, 68, 68, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
