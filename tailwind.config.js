/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: { 950:'#09090b', 900:'#0f0f12', 800:'#18181b', 700:'#1f1f23', 600:'#27272a' },
        accent:  { violet:'#8b5cf6', emerald:'#10b981', amber:'#f59e0b', rose:'#f43f5e', cyan:'#06b6d4' },
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'glow':     'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from:{ opacity:'0' },                          to:{ opacity:'1' } },
        slideUp: { from:{ opacity:'0', transform:'translateY(12px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        glow:    { '0%,100%':{ boxShadow:'0 0 20px rgba(139,92,246,0.3)' }, '50%':{ boxShadow:'0 0 40px rgba(139,92,246,0.6)' } },
      },
    },
  },
  plugins: [],
};
