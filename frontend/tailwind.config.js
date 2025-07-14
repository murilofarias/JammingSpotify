/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Spotify green with a few complementary accents.
        spotify: {
          green: '#1db954',
          'green-dim': '#159a43',
          'green-soft': 'rgba(29, 185, 84, 0.14)',
        },
        accent: {
          purple: '#8b5cf6',
          cyan: '#06b6d4',
        },
        ink: {
          900: '#0a0a0a',
          800: '#111111',
          700: '#171717',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 32px -6px rgba(29, 185, 84, 0.35)',
        'glow-purple': '0 0 32px -6px rgba(139, 92, 246, 0.35)',
        card: '0 10px 30px -14px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'mesh-radial':
          'radial-gradient(1200px 600px at 10% -10%, rgba(29, 185, 84, 0.12), transparent 60%), radial-gradient(800px 500px at 110% 20%, rgba(139, 92, 246, 0.09), transparent 60%), radial-gradient(700px 500px at 50% 120%, rgba(6, 182, 212, 0.07), transparent 60%)',
      },
      animation: {
        'eq-1': 'eqbar 1.1s ease-in-out infinite',
        'eq-2': 'eqbar 0.9s ease-in-out infinite 0.15s',
        'eq-3': 'eqbar 1.3s ease-in-out infinite 0.3s',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        eqbar: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
