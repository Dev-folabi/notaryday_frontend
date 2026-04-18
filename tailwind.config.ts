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
        // Core palette (semantic, clean names)
        navy: "#0F2C4E",
        "navy-active": "#1A3D6B",

        blue: "#2563EB",
        "blue-hover": "#3B82F6",
        "blue-bg": "#EFF6FF",
        "blue-border": "#BFDBFE",

        teal: "#0E7B6C",
        "teal-bg": "#ECFDF5",
        "teal-border": "#6EE7B7",

        amber: "#D97706",
        "amber-bg": "#FEF3C7",
        "amber-border": "#FDE68A",

        red: "#C0392B",

        slate: "#475569",
        "slate-secondary": "#64748B",
        muted: "#94A3B8",

        border: "#E2E8F0",
        background: "#F8FAFC",
        surface: "#FFFFFF",

        // Domain-specific
        "scanback": "#FEF3C7",
        "gap-finder": "#EDE9FE",

        "pro": "#F59E0B",
      },

      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "14px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
        fab: "0 4px 16px rgba(15,44,78,0.4)",
        dropdown: "0 6px 20px rgba(0,0,0,0.1)",
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
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "16px",
          sm: "20px",
          lg: "32px",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;