import type { Config } from 'tailwindcss';
import presetQuick from 'franken-ui/shadcn-ui/preset-quick';
import ui from 'franken-ui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	presets: [presetQuick()],
	theme: {
		extend: {}
	},

	plugins: [
		ui({
			components: {
				modal: {
					hooks: {},
					media: true
				}
			}
		})
	]
} as Config;
