/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
	"./component-v2/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'r-regular': ['roboto-condensed-regular'],
        'r-medium': ['roboto-condensed-medium'],
        'r-semibold': ['roboto-condensed-semibold'],
      },
      fontSize: {
        'text-field': '15px',
        'header-3': '16px',
        'header-2': '20px',
        'description': '16px',
        'header-1': '24px',
        'data': '14px',
        'topbar': '28px',
      },
      colors: {
        primary: "#1A736A",
        secondary: "#95E7E7",
        "background-1": "#D9D9D9",
        "background-2": "#DEFFFD",
        fail: "#F77979",
        warning: "#F2BC79",
        success: "#A6F98D",
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
