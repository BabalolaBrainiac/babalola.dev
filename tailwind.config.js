/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",

		// Or if using `src` directory:
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		// colors: {
		// 	"button-green": "#02FEF1",
		// 	"darker-green": "#035554",
		// 	"button-purple": "#AA01FC",
		// },
		// backgroundImage: {
		// 	background:
		// 		"url('/Users/opeyemibabalola/Desktop/portfolio/my-portfolio/assets/image.png')",
		// },
		extend: {},
	},
	plugins: [],
};
