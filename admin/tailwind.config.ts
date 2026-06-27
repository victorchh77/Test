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
        bg:       '#080C11',
        sidebar:  '#0B0F18',
        card:     '#0F1520',
        'card-elevated': '#141C2A',
        border:   '#1C2A3D',
        'border-bright': '#2A3F58',
        orange: {
          DEFAULT: '#FF8C00',
          hover:   '#E67E00',
          light:   '#FFB347',
          dim:     'rgba(255, 140, 0, 0.15)',
          glow:    'rgba(255, 140, 0, 0.4)',
        },
        textprim: '#EEF4FF',
        textsec:  '#7A8FA8',
        textmuted: '#3D5068',
        success:  '#00C984',
        error:    '#FF4D6A',
        warning:  '#FFB800',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange-sm':  '0 0 12px rgba(255, 140, 0, 0.2)',
        'orange':     '0 0 24px rgba(255, 140, 0, 0.3)',
        'orange-lg':  '0 0 48px rgba(255, 140, 0, 0.35)',
        'card':       '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-lg':    '0 8px 48px rgba(0, 0, 0, 0.7)',
        'inset-t':    'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'fade-in':      'fadeIn 0.25s ease-out',
        'slide-in':     'slideIn 0.3s ease-out',
        'slide-up':     'slideUp 0.35s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'float':        'float 4s ease-in-out infinite',
        'border-spin':  'borderSpin 5s ease infinite',
        'glow-breath':  'glowBreath 3s ease-in-out infinite',
        'scan-down':    'scanDown 12s linear infinite',
        'value-pop':    'valuePop 0.5s ease-out',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' },                                      to: { opacity: '1' } },
        slideIn:     { from: { transform: 'translateX(-12px)', opacity: '0' },      to: { transform: 'translateX(0)', opacity: '1' } },
        slideUp:     { from: { transform: 'translateY(14px)', opacity: '0' },       to: { transform: 'translateY(0)', opacity: '1' } },
        scaleIn:     { from: { transform: 'scale(0.96)', opacity: '0' },            to: { transform: 'scale(1)', opacity: '1' } },
        glowPulse:   {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 140, 0, 0.15)' },
          '50%':      { boxShadow: '0 0 40px rgba(255, 140, 0, 0.4)' },
        },
        shimmer:     {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition:  '200% 0' },
        },
        float:       {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        borderSpin:  {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glowBreath:  {
          '0%, 100%': { opacity: '0.25', transform: 'scale(1)' },
          '50%':      { opacity: '0.65', transform: 'scale(1.1)' },
        },
        scanDown:    {
          '0%':   { transform: 'translateY(-2px)', opacity: '0.7' },
          '80%':  { opacity: '0.3' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        valuePop:    {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
