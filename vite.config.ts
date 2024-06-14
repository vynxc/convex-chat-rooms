import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
dotenv.config();
const url = process.env.PUBLIC_CONVEX_URL!.replace('convex.cloud', 'convex.site');
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/convex': {
				target: url,
				changeOrigin: true
			}
		}
	}
});
