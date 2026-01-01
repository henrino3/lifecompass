import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cosmic theme (default)
        cosmic: {
          bg: '#0a0a1a',
          'bg-light': '#12122a',
          surface: '#1a1a3a',
          border: '#2a2a5a',
          accent: '#f59e0b',
          'accent-hover': '#fbbf24',
          text: '#e5e7eb',
          'text-muted': '#9ca3af',
        },
        // Calm theme
        calm: {
          bg: '#1a1f1c',
          'bg-light': '#232a26',
          surface: '#2d3830',
          border: '#3d4a3f',
          accent: '#86efac',
          'accent-hover': '#a7f3d0',
          text: '#f0fdf4',
          'text-muted': '#a7f3d0',
        },
        // Minimal theme
        minimal: {
          bg: '#0a0a0a',
          'bg-light': '#141414',
          surface: '#1f1f1f',
          border: '#2a2a2a',
          accent: '#ffffff',
          'accent-hover': '#e5e5e5',
          text: '#fafafa',
          'text-muted': '#737373',
        },
        // Sunset theme
        sunset: {
          bg: '#1a0a14',
          'bg-light': '#2a1424',
          surface: '#3a1e34',
          border: '#5a2e4a',
          accent: '#fb923c',
          'accent-hover': '#fdba74',
          text: '#fef2f2',
          'text-muted': '#fca5a5',
        },
      },
      fontFamily: {
        display: ['var(--font-crimson)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
