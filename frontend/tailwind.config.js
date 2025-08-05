/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				'r-regular': ['roboto-condensed-regular'],
				'r-medium': ['roboto-condensed-medium'],
				'r-semibold': ['roboto-condensed-semibold'],
			},
			fontSize: {
				'text-field': '15px',  // Regular
				'header-3': '16px',  // SemiBold
				'header-2': '20px',  // Medium
				'description': '16px',  // Regular
				'header-1': '24px',  // SemiBold
				'data': '14px',  // Regular
				'topbar': '28px',  // SemiBold
			},
			colors: {
				primary: "#1A736A",  // e.g. blue-700
				secondary: "#95E7E7",  // e.g. purple-600
				"background-1": "#D9D9D9", // light gray
				"background-2": "#DEFFFD", // darker gray
				fail: "#F77979",  // red-600
				warning: "#F2BC79",  // amber-600
				success: "#A6F98D",  // green-600
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}