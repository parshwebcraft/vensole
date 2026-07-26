import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        ivory: { DEFAULT: '#F8F4EE', dark: '#EDE8DF' },
        gold: { DEFAULT: '#C8A46A', light: '#D4B483', dark: '#A8844A' },
        bronze: '#8B5E34',
        midnight: '#111111',
        charcoal: '#2C2C2C',
        parchment: '#F2EBD9',
        peacock: { blue: '#006D77', green: '#2A9D8F' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-shimmer': 'linear-gradient(135deg, #A8844A 0%, #C8A46A 50%, #D4B483 100%)',
        'ivory-gradient': 'linear-gradient(180deg, #F8F4EE 0%, #EDE8DF 100%)',
        'dark-gradient': 'linear-gradient(180deg, #111111 0%, #1A1512 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(200,164,106,0.4), 0 0 60px rgba(200,164,106,0.1)',
        'glow-sm': '0 0 10px rgba(200,164,106,0.2)',
        soft: '0 4px 24px rgba(0,0,0,0.08)',
        deep: '0 8px 48px rgba(0,0,0,0.16)',
        card: '0 2px 16px rgba(0,0,0,0.06)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(1deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-0.5deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'golden-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200,164,106,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(200,164,106,0.5), 0 0 80px rgba(200,164,106,0.2)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'golden-pulse': 'golden-pulse 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
