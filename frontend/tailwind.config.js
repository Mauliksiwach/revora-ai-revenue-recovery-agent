/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        revora: {
          bg: "#0B0F19",
          card: "#111827",
          cardHover: "#1F2937",
          border: "#1F293D",
          borderHover: "#374151",
          primary: "#3B82F6",
          primaryHover: "#2563EB",
          accent: "#6366F1",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          text: "#F9FAFB",
          textMuted: "#9CA3AF",
          textDim: "#6B7280",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
