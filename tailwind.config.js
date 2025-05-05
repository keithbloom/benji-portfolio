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
        'zone-41-orange': '#ffc665',
        'zone-43-pink': '#ffd3d9',
      },
			titleColours: {
				1: {
					container: 'bg-blue-200',
					heading: 'text-blue-800',
				},
				2: {
					container: 'bg-red-200',
					heading: 'text-red-800',
				},
				3: {
					container: 'bg-green-200',
					heading: 'text-green-800',
				},
				4: {
					container: 'bg-purple-200',
					heading: 'text-purple-800',
				},
				5: {
					container: 'bg-yellow-200',
					heading: 'text-yellow-800',
				},
				6: {
					container: 'bg-pink-200',
					heading: 'text-pink-800',
				},
				7: {
					container: 'bg-indigo-200',
					heading: 'text-indigo-800',
				},
				8: {
					container: 'bg-gray-200',
					heading: 'text-gray-800',
				},
			},
			fontFamily: {
				carter: ['"Carter One"', 'sans-serif'],
			},
		},
	},
	safelist: ['page-head','page-head-1-container', 'page-head-2-container', 'page-head-3-container', 'page-head-4-container',
    'page-head-5-container', 'page-head-6-container', 'page-head-7-container', 'page-head-8-container',
    'page-head-1-heading', 'page-head-2-heading', 'page-head-3-heading', 'page-head-4-heading',
    'page-head-5-heading', 'page-head-6-heading', 'page-head-7-heading', 'page-head-8-heading'],
	plugins: [
		// Custom plugin to generate color tuple classes
		function({ addComponents, theme }) {
      const titleColours = theme('titleColours') || {};
      const components = {};
      
      Object.keys(titleColours).forEach((pageIndex) => {
        components[`.page-head-${pageIndex}-container`] = {
          [`@apply ${titleColours[pageIndex].container}`]: {},
        };
        
        components[`.page-head-${pageIndex}-heading`] = {
          [`@apply ${titleColours[pageIndex].heading}`]: {},
        };
      });
      
      addComponents(components);
    },
	],
};
