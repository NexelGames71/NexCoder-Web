/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        shell: "#f7f7f8",
        line: "#e7e7e8",
        panel: "#ffffff",
        muted: "#6b6b6f",
        accent: {
          blue: "#2f6bff",
          cyan: "#1fb6ff",
          violet: "#8b3dff",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(17, 17, 17, 0.04)",
      },
    },
  },
  plugins: [],
};
