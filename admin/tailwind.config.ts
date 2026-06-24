import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#0F1419',
        sidebar:  '#1A202C',
        card:     '#1E2530',
        border:   '#2D3748',
        orange:   { DEFAULT: '#ED8936', hover: '#DD6B20', light: '#F6AD55' },
        textprim: '#F7FAFC',
        textsec:  '#A0AEC0',
        success:  '#48BB78',
        error:    '#F56565',
        warning:  '#ECC94B',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateY(-8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
export default config;
