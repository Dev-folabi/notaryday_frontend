import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-navy": "#0F2C4E",
        "navy-active": "#1A3D6B",
        "interactive-blue": "#2563EB",
        "blue-hover": "#3B82F6",
        "teal-success": "#0E7B6C",
        "amber-warning": "#D97706",
        "red-danger": "#C0392B",
        "slate-body": "#475569",
        "slate-secondary": "#64748B",
        "border": "#E2E8F0",
        "bg": "#F8FAFC",
        "surface": "#FFFFFF",
        "scanback-bg": "#FEF3C7",
        "gap-finder-bg": "#EDE9FE",
        "pro-gold": "#F59E0B",
        "muted": "#94A3B8",
        "blue-bg": "#EFF6FF",
        "teal-bg": "#ECFDF5",
        "amber-bg": "#FEF3C7",
        "violet-bg": "#EDE9FE",
        "teal-b": "#6EE7B7",
        "amber-b": "#FDE68A",
        "blue-b": "#BFDBFE",
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        button: "8px",
        input: "6px",
        "6px": "6px",
        "8px": "8px",
        "10px": "10px",
        "14px": "14px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
        fab: "0 4px 16px rgba(15,44,78,0.4)",
        menu: "0 6px 20px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
