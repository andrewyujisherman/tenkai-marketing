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
        'tenkai': '0.625rem',
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
      },
      animation: {
        'sakura-fall': 'sakura-fall 10s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
