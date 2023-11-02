import { z, defineCollection } from 'astro:content';

const images = defineCollection({
	type: 'data',
	schema: z.object({
		data: z.any(),
	}),
});

// Expose your defined collection to Astro
// with the `collections` export
export const collections = { images };
