import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        soil: {
          dark: 'var(--soil-dark)',
          clay: 'var(--soil-clay)',
          rich: 'var(--soil-rich)',
          taupe: 'var(--soil-taupe)',
          sand: 'var(--soil-sand)',
          cream: 'var(--soil-cream)',
        },
        forest: {
          DEFAULT: 'var(--forest)',
          light: 'var(--forest-light)',
        },
        earth: {
          gray: 'var(--earth-gray)',
        },
        deep: {
          soil: 'var(--deep-soil)',
        },
        "style-primary":   "var(--style-color-primary)",
        "style-secondary": "var(--style-color-secondary)",
        "style-accent":    "var(--style-color-accent)",
        "style-bg":        "var(--style-color-bg)",
        "style-surface":   "var(--style-color-surface)",
        "style-fg":        "var(--style-color-fg)",
        "style-muted":     "var(--style-color-muted)",
        "style-border":    "var(--style-color-border)",
      },
      fontFamily: {
        heading: ['var(--font-almarai)', 'sans-serif'],
        body: ['var(--font-almarai)', 'sans-serif'],
        jozoor: ['var(--font-almarai)', 'sans-serif'],
        arabic: ['var(--font-almarai)', 'sans-serif'],
        almarai: ['var(--font-almarai)', 'sans-serif'],
      },
      fontSize: {
        "fluid-sm": "clamp(0.8rem, 1vw, 0.875rem)",
        "fluid-base": "clamp(0.95rem, 1.2vw, 1.05rem)",
        "fluid-lg": "clamp(1.05rem, 1.5vw, 1.125rem)",
        "fluid-xl": "clamp(1.2rem, 2vw, 1.25rem)",
        "fluid-2xl": "clamp(1.4rem, 2.5vw, 1.5rem)",
        "fluid-3xl": "clamp(1.8rem, 3.5vw, 2rem)",
        "fluid-4xl": "clamp(2rem, 5vw, 2.5rem)",
        "fluid-5xl": "clamp(2.5rem, 6vw, 3rem)",
        "fluid-6xl": "clamp(3rem, 8vw, 3.75rem)",
      },
      animation: {
        shimmer: "shimmer 2s ease-in-out infinite",
        gradient: "gradientShift 8s ease infinite",
        "count-up": "countUp 0.6s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      borderRadius: {
        "style-card":  "var(--style-radius-card)",
        "style-btn":   "var(--style-radius-btn)",
        "style-input": "var(--style-radius-input)",
      },
      boxShadow: {
        "elevation-sm": "var(--shadow-sm)",
        "elevation-md": "var(--shadow-md)",
        "elevation-lg": "var(--shadow-lg)",
        "elevation-xl": "var(--shadow-xl)",
        "elevation-2xl": "var(--shadow-2xl)",
        "style-card":  "var(--style-shadow-card)",
        "style-hover": "var(--style-shadow-card-hover)",
        "style-focus": "var(--style-shadow-focus)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography"), require("@tailwindcss/container-queries")],
};

export default config;
