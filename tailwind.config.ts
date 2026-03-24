import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ivory: '#FEFCF8',
        cream: '#FAF7F2',
        parchment: '#F5F1EB',
        torii: {
          DEFAULT: '#C1554D',
          light: '#D4736C',
          dark: '#A33F38',
          subtle: '#F4E4E1',
        },
        charcoal: '#2D2B2A',
        'warm-gray': '#8A8580',
        'muted-gray': '#B5B0AA',
        'tenkai-border': '#E8E4DE',
        'tenkai-border-light': '#F0ECE6',
        success: '#4CAF50',
        warning: '#F5A623',
        error: '#D32F2F',
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      maxWidth: {
        'container': '1200px',
      },
      spacing: {
        'section': '120px',
        'section-mobile': '80px',
        'sidebar': '260px',
      },
      borderRadius: {
        'tenkai-sm': '0.25rem',
        'tenkai': '0.625rem',
        'tenkai-lg': '1rem',
      },
      boxShadow: {
        'tenkai-sm': '0 1px 3px rgba(45,43,42,0.06)',
        'tenkai-md': '0 4px 12px rgba(45,43,42,0.08)',
        'tenkai-lg': '0 8px 24px rgba(45,43,42,0.12)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '600ms',
      },
      keyframes: {
        'sakura-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'slide-out': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'flash-green': {
          '0%': { backgroundColor: 'rgba(76,175,80,0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'flash-amber': {
          '0%': { backgroundColor: 'rgba(245,166,35,0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'flash-red': {
          '0%': { backgroundColor: 'rgba(211,47,47,0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'progress-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'slide-in-task': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-badge': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'sakura-fall': 'sakura-fall 10s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'slide-out': 'slide-out 0.3s ease-in forwards',
        'flash-green': 'flash-green 0.6s ease-out forwards',
        'flash-amber': 'flash-amber 0.6s ease-out forwards',
        'flash-red': 'flash-red 0.6s ease-out forwards',
        'progress-spin': 'progress-spin 1.5s linear infinite',
        'slide-in-task': 'slide-in-task 0.3s ease-out forwards',
        'pulse-badge': 'pulse-badge 0.3s ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
