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
          bg: "#090a0f",       // پس‌زمینه اصلی تاریک و عمیق
          s1: "#12141c",       // پس‌زمینه کارت‌ها و پنل‌ها
          s2: "#1a1d28",       // پس‌زمینه اینپوت‌ها و آیتم‌های داخلی
          s3: "#242838",       // هاور و وضعیت‌های فعال
          border: "#282c3f",   // رنگ بردرهای شیک
          t1: "#f3f4f6",       // متن اصلی روشن
          t2: "#9ca3af",       // متن ثانویه
          t3: "#6b7280",       // متن‌های ریز و خاموش
          success: "#10b981",  // سبز وضعیت فعال
          danger: "#ef4444",   // قرمز هشدار و حذف
          warning: "#f59e0b",  // زرد/نارنجی انقضا
        },
        neon: {
          DEFAULT: "#f59e0b",  // رنگ امبر/نئون اصلی (یا teal #06b6d4)
          glow: "#fbbf24",
          teal: "#14b8a6",
          purple: "#8b5cf6"
        }
      },
      fontFamily: {
        fa: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(245, 158, 11, 0.15)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      }
    },
  },
  plugins: [],
}