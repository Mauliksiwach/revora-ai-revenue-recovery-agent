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
        // Palette: Ivory, Nude, Dusty Rose, Sage, Baby Blue
        ivory: {
          DEFAULT: "#F7F5F0",
          50: "#FAF9F6",
          100: "#F7F5F0",
          200: "#EFEBE2",
          300: "#E1DAD3",
          400: "#D4C9BF",
          500: "#B8AAA0",
        },
        sage: {
          DEFAULT: "#6B7F64",
          50: "#F2F6F0",
          100: "#E4EDE1",
          200: "#C8D9C2",
          300: "#A9C1A2",
          400: "#8AA683",
          500: "#6B7F64",
          600: "#55674F",
          700: "#414F3C",
          800: "#2F3A2B",
          900: "#1E251B",
        },
        nude: {
          DEFAULT: "#E4C9B6",
          50: "#FCF7F3",
          100: "#F7ECE3",
          200: "#EED7C8",
          300: "#E4C9B6",
          400: "#D3B19B",
          500: "#BA947D",
          600: "#99735D",
        },
        rose: {
          DEFAULT: "#D7A49A",
          50: "#FCF6F5",
          100: "#F8ECE9",
          200: "#EED4CE",
          300: "#D7A49A",
          400: "#C48A7F",
          500: "#AD6F63",
          600: "#945448",
          700: "#7A3C31",
        },
        babyblue: {
          DEFAULT: "#A4B1BA",
          50: "#F4F7F9",
          100: "#E7EDF1",
          200: "#D0DDE4",
          300: "#A4B1BA",
          400: "#8697A2",
          500: "#6B7D89",
          600: "#54646F",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          cardMuted: "#FAF8F4",
          border: "#E5DFD5",
          borderLight: "#EFEAE2",
        },
        ink: {
          DEFAULT: "#1F241F",
          primary: "#1C201C",
          secondary: "#3E473E",
          muted: "#6B756B",
          subtle: "#919D91",
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
