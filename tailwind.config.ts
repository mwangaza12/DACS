import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        canvas:  "#070B14",
        surface: "#0D1117",
        card:    "#111827",
        border:  "#1F2937",
        "border-subtle": "#161D2A",

        // Primary — Indigo
        primary: {
          DEFAULT: "#6366F1",
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          900: "#312E81",
        },

        // Accent — Teal
        teal: {
          DEFAULT: "#14B8A6",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
        },

        // Semantic
        success: "#4ADE80",
        warning: "#FBBF24",
        danger:  "#F87171",
        info:    "#60A5FA",

        // Text
        "text-primary":   "#F1F5F9",
        "text-secondary": "#94A3B8",
        "text-tertiary":  "#475569",
        "text-muted":     "#334155",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-indigo": "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)",
        "glow-teal":   "radial-gradient(ellipse at 50% 100%, rgba(20,184,166,0.1) 0%, transparent 60%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        "glow-sm":  "0 0 20px rgba(99,102,241,0.15)",
        "glow-md":  "0 0 40px rgba(99,102,241,0.2)",
        "glow-teal":"0 0 30px rgba(20,184,166,0.15)",
        "card":     "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover":"0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)",
      },
      animation: {
        "fade-up":     "fade-up 0.5s ease-out forwards",
        "fade-in":     "fade-in 0.4s ease-out forwards",
        "shimmer":     "shimmer 1.5s infinite",
        "pulse-slow":  "pulse 3s ease-in-out infinite",
        "spin-slow":   "spin 8s linear infinite",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
