/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./layouts/**/*.html', './content/**/*.md', './themes/**/layouts/**/*.html'],
	theme: {
		extend: {
			colors: {
				'zone-40-blue': '#519bf4',
				'zone-40-grey': '#a1c3d3',
				'zone-42-green': '#ccf462',
				'zone-44-green': '#cdf564',
				'zone-44-pink': '#f673a2',
				'zone-41-red': '#ff4633',
				'zone-41-orange': '#0011ff',
				'zone-43-pink': '#ffd3d9',
				'lusion': {
					dark: '#141619', // Dark background
					slate: '#2C2E3A', // Medium dark
					blue: '#050A44', // Deep blue
					royal: '#0A21C0', // Royal blue
					light: '#B3B4BD', // Light gray
				},
				'type-terms': {
					navy: '#25274D', // Main navy background
					purple: '#464866', // Purple-gray
					gray: '#AAABB8', // Light gray
					cyan: '#2E9CCA', // Bright cyan
					teal: '#29648A', // Darker teal
				},
			},
			titleColours: {
				1: {
					container: 'bg-blue-950',
					heading: 'text-red-300',
				},
				2: {
					container: 'bg-blue-700',
					heading: 'text-blue-50',
				},
				3: {
					container: 'bg-cyan-500',
					heading: 'text-blue-950',
				},
				4: {
					container: 'bg-teal-600',
					heading: 'text-teal-50',
				},
				5: {
					container: 'bg-sky-400',
					heading: 'text-slate-800',
				},
				6: {
					container: 'bg-indigo-800',
					heading: 'text-indigo-100',
				},
				7: {
					container: 'bg-blue-600',
					heading: 'text-cyan-100',
				},
				8: {
					container: 'bg-violet-700',
					heading: 'text-violet-100',
				},
			},
			fontFamily: {
				carter: ['Cal Sans', 'sans-serif'],
			},
		},
	},
	safelist: [
		'page-head',
		'page-head-1-container',
		'page-head-2-container',
		'page-head-3-container',
		'page-head-4-container',
		'page-head-5-container',
		'page-head-6-container',
		'page-head-7-container',
		'page-head-8-container',
		'page-head-1-heading',
		'page-head-2-heading',
		'page-head-3-heading',
		'page-head-4-heading',
		'page-head-5-heading',
		'page-head-6-heading',
		'page-head-7-heading',
		'page-head-8-heading',
		'content',
	],
	plugins: [
		// Custom plugin to generate color tuple classes
		
		function ({ addComponents, theme }) {
			const titleColours = theme('titleColours') || {};
			const components = {};

			Object.keys(titleColours).forEach((pageIndex) => {
				components[`.page-head-${pageIndex}-container`] = {
					[`@apply ${titleColours[pageIndex].container}`]: {},
					'h2': {
						[`@apply ${titleColours[pageIndex].heading}`]: {},
					},
				};
			});

			console.log(components);
			addComponents(components);
		},
	],
};
