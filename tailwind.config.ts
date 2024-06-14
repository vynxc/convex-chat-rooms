import type { Config } from 'tailwindcss';
import presetQuick from 'franken-ui/shadcn-ui/preset-quick';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	presets: [presetQuick()],
	theme: {
		extend: {}
	},

	plugins: []
} as Config;
