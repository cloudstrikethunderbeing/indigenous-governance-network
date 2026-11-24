import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        subtle: "0 1px 3px 0 rgba(30,10,10,0.06), 0 1px 2px -1px rgba(30,10,10,0.04)",
        elevated: "0 8px 24px -8px rgba(30,10,10,0.18), 0 2px 8px -2px rgba(30,10,10,0.08)",
        network: "0 2px 10px -4px rgba(30,10,10,0.12), 0 1px 3px -1px rgba(30,10,10,0.06)",
        "os-icon": "0 1px 2px 0 rgba(30,10,10,0.06)",
        "os-tile": "0 10px 22px -10px rgba(30,10,10,0.22)",
        "os-dock": "0 18px 40px -18px rgba(30,10,10,0.3)",
        "os-window": "0 30px 60px -24px rgba(30,10,10,0.32)",
        wallpaper: "0 24px 60px -28px rgba(20,12,8,0.45), 0 2px 10px -2px rgba(20,12,8,0.18)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "phase-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.72" },
        },
        "popup-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "scrim-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "option-select": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.015)" },
          "100%": { transform: "scale(1)" },
        },
        "bar-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "node-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "link-flow": {
          from: { strokeDashoffset: "16" },
          to: { strokeDashoffset: "0" },
        },
        "node-in": {
          from: { opacity: "0", transform: "scale(0.85)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "os-boot": {
          from: { opacity: "0", transform: "scale(0.98) translateY(6px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "os-window-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "os-preview-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        "wallpaper-in": {
          from: { opacity: "0", transform: "scale(1.02)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "file-drop-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "gov-seal-in": {
          from: { opacity: "0", transform: "scale(0.82) rotate(-6deg)" },
          to: { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
        "phase-pulse": "phase-pulse 2.4s ease-in-out infinite",
        "popup-in": "popup-in 0.32s cubic-bezier(0.4, 0, 0.2, 1) both",
        "scrim-in": "scrim-in 0.24s ease-out both",
        "option-select": "option-select 0.24s ease-out",
        "bar-grow": "bar-grow 0.7s cubic-bezier(0.4, 0, 0.2, 1) both",
        "node-pulse": "node-pulse 3s ease-in-out infinite",
        "link-flow": "link-flow 1.6s linear infinite",
        "node-in": "node-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        "os-boot": "os-boot 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        "os-window-in": "os-window-in 0.34s cubic-bezier(0.4, 0, 0.2, 1) both",
        "os-preview-pulse": "os-preview-pulse 2.6s ease-in-out infinite",
        "wallpaper-in": "wallpaper-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        "file-drop-pulse": "file-drop-pulse 1.4s ease-in-out infinite",
        "gov-seal-in": "gov-seal-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        "cosmos-aurora": "cosmos-aurora-drift 18s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate",
        "cosmos-core": "cosmos-core-pulse 4.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "cosmos-orbit": "cosmos-orbit 26s linear infinite",
        "cosmos-reveal": "cosmos-reveal 0.64s cubic-bezier(0.16, 1, 0.3, 1) both",
        "cosmos-rise": "cosmos-rise 1.1s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
