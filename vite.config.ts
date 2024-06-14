import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/convex': {
				target: 'http://localhost:3211/',
				changeOrigin: true
			}
		}
	}
});
