import { z, defineCollection } from "astro:content";
import { glob } from 'astro/loaders';

const images = defineCollection({
    loader: glob({pattern: "**/*.json", base: "./src/content/images"}),
    schema: z.object({
        images: z.array(z.string()),
        content: z.string(),
        author: z.string(),
        category: z.string(),
        origin: z.string(),
        date: z.string(),
        localImagesPath: z.string(),
    }),
});

// Expose your defined collection to Astro
// with the `collections` export
export const collections = { images };
