/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../libs/ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Industrial Theme Colors
        industrial: {
          orange: 'hsl(25 95% 53%)',      // Primary construction orange
          blue: 'hsl(220 91% 60%)',       // Industrial machinery blue
          dark: 'hsl(210 25% 8%)',        // Deep industrial dark
          surface: 'hsl(210 25% 12%)',    // Surface panels
          border: 'hsl(210 25% 20%)',     // Panel borders
        },
        // Semantic Theme Colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(25 95% 53%), hsl(35 95% 58%))',
        'gradient-surface': 'linear-gradient(180deg, hsl(210 25% 12%), hsl(210 25% 10%))',
        'gradient-accent': 'linear-gradient(135deg, hsl(220 91% 60%), hsl(230 91% 65%))',
      },
      boxShadow: {
        'industrial': '0 10px 30px -5px hsl(210 25% 4% / 0.3)',
        'glow': '0 0 40px hsl(25 95% 53% / 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { 
            transform: 'scale(1)', 
            opacity: '0.3',
            boxShadow: '0 0 20px hsl(25 95% 53% / 0.3)'
          },
          '70%': { 
            transform: 'scale(1.4)', 
            opacity: '0',
            boxShadow: '0 0 40px hsl(25 95% 53% / 0)'
          },
          '100%': { 
            transform: 'scale(1.4)', 
            opacity: '0',
            boxShadow: '0 0 40px hsl(25 95% 53% / 0)'
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}