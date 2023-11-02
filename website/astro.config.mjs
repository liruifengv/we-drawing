import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import nodejs from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind()],
	output: 'server',
	adapter: nodejs({ mode: 'standalone' }),
});
