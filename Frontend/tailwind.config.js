/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vtt: {
          bg: "#090a0f",
          s1: "#12141c",
          s2: "#1a1d28",
          s3: "#242838",
          border: "#282c3f",
          t1: "#f3f4f6",
          t2: "#9ca3af",
          t3: "#6b7280",
          success: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
        },
        neon: {
          DEFAULT: "#f59e0b",
          glow: "#fbbf24",
          teal: "#14b8a6",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        fa: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(245, 158, 11, 0.15)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};