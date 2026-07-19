import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        navy: "#0F2C4E",
        "navy-active": "#1A3D6B",
        "navy-2": "#1A3D6B",

        blue: "#2563EB",
        "blue-hover": "#3B82F6",
        "blue-bg": "#EFF6FF",
        "blue-border": "#BFDBFE",

        teal: "#0E7B6C",
        "teal-bg": "#ECFDF5",
        "teal-border": "#6EE7B7",

        amber: "#D97706",
        "amber-bg": "#FFFBEB",
        "amber-border": "#FDE68A",
        "amber-2": "#FEF3C7",

        red: "#C0392B",
        "red-bg": "#FEF2F2",
        "red-border": "#FECACA",

        violet: "#7C3AED",
        "violet-bg": "#EDE9FE",
        "violet-border": "#C4B5FD",

        slate: "#475569",
        "slate-secondary": "#64748B",
        "slate-2": "#64748B",
        muted: "#94A3B8",
        light: "#CBD5E1",

        border: "#E2E8F0",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        white: "#FFFFFF",

        // Domain-specific
        scanback: "#FEF3C7",
        "gap-finder": "#EDE9FE",

        pro: "#F59E0B",
        gold: "#F59E0B",

        // Aliases heavily used in UI
        "primary-navy": "#0F2C4E",
        "pro-gold": "#F59E0B",
        "teal-success": "#0E7B6C",
        "amber-warning": "#D97706",
        "interactive-blue": "#2563EB",
        "slate-body": "#475569",
        "violet-light": "#EDE9FE",
        "blue-light": "#EFF6FF",
      },

      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        button: "9px",
        input: "8px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
        fab: "0 6px 20px rgba(15,44,78,0.35)",
        dropdown: "0 6px 20px rgba(0,0,0,0.1)",
        modal: "0 24px 64px rgba(0,0,0,0.28)",
      },

      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        14: "56px",
        16: "64px",
        sidebar: "256px",
      },

      maxWidth: {
        "7xl": "720px",
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "16px",
          sm: "20px",
          lg: "32px",
        },
      },

      keyframes: {
        modalIn: {
          from: { transform: "translateY(12px) scale(0.98)", opacity: "0" },
          to: { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        toastIn: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        drawerIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },

      animation: {
        modalIn: "modalIn 0.22s ease",
        toastIn: "toastIn 0.22s ease",
        drawerIn: "drawerIn 0.24s ease",
      },
    },
  },
  plugins: [],
} satisfies Config;
