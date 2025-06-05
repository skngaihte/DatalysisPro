// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Indigo from Tailwind's default palette
        secondary: "#6366F1",
        accent: "#8B5CF6",
        background: "#F9FAFB",
        text: "#111827",
        muted: "#6B7280",
      },
    },
  },
  plugins: [],
};