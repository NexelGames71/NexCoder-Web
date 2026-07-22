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
        // Dark theme. `ink` is the primary (light) text; solid buttons that use
        // `bg-ink` pair it with `text-shell` for dark text on a light control.
        ink: "#f2f3f7",
        shell: "#0a0a0f",
        line: "#272730",
        panel: "#141419",
        muted: "#9a9ba8",
        accent: {
          blue: "#4d7cff",
          cyan: "#22c9ff",
          violet: "#a78bfa",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
