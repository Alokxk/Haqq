/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f0f2f5",
        "bg-2": "#e8eaed",
        surface: "#f7f8fa",
        "surface-2": "#ffffff",
        ink: "#0d1117",
        "ink-2": "#2d3340",
        "ink-3": "#6b7280",
        accent: "#2563eb",
        "accent-dark": "#1d4ed8",
        "accent-light": "#eff6ff",
        border: "#d1d5db",
        "border-2": "#9ca3af",
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}