/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#070b12',
        panel: '#111827',
        screen: '#1f2937',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        reveal: 'reveal 280ms ease-out',
      },
    },
  },
  plugins: [],
}
