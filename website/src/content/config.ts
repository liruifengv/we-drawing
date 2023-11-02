import { z, defineCollection } from 'astro:content';

const images = defineCollection({
	type: 'data',
	schema: z.object({
    images: z.array(z.string()),
    content: z.string(),
    author: z.string(),
    category: z.string(),
    origin: z.string(),
    date : z.string(),
    localImagesPath: z.string(),
	}),
});

// Expose your defined collection to Astro
// with the `collections` export
export const collections = { images };
