/** @type {import('tailwindcss').Config} */
const { tokens } = require("./src/style/style_token");

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./component-v2/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: {
        regular: tokens.fontFamily.regular,
        medium: tokens.fontFamily.medium,
        semibold: tokens.fontFamily.semibold,
        bold: tokens.fontFamily.bold,
      },

      fontSize: Object.fromEntries(
        Object.entries(tokens.fontSize).map(([k, v]) => [k, v])
      ),
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      // If you want to use your RN shadow tokens as Tailwind utilities:
      boxShadow: {
        sm: `${tokens.shadows.sm.shadowOffset.width}px ${tokens.shadows.sm.shadowOffset.height}px ${tokens.shadows.sm.shadowRadius}px rgba(0,0,0,${tokens.shadows.sm.shadowOpacity})`,
        md: `${tokens.shadows.md.shadowOffset.width}px ${tokens.shadows.md.shadowOffset.height}px ${tokens.shadows.md.shadowRadius}px rgba(0,0,0,${tokens.shadows.md.shadowOpacity})`,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};