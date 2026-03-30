module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        darkBg: '#0f172a',    // slate-900
        darkCard: '#1e293b',  // slate-800
        darkInput: '#334155', // slate-700
      }
    },
  },
  plugins: [],
};
