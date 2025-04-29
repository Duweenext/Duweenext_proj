/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: '#087979',
        secondary: '#95E7E7',
        good: '#A6F98D',
        warning: '#F2BC79',
        failed: '#F77979',
        accent: '#AB8BFF'
      }
    },
  },
  plugins: [],
}