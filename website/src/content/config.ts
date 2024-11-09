import { z, defineCollection } from "astro:content";

// 定义 images 集合的数据结构
const images = defineCollection({
    type: "data", // 'data' 用于 JSON/YAML/TOML
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
