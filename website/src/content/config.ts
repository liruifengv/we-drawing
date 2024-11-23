import { z, defineCollection } from "astro:content";

// 定义 images 集合的数据结构
const images = defineCollection({
    //type: "content": 用于 Markdown/MDX 文件
    //type: "data": 用于 JSON/YAML/TOML 文件
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

const flux_images = defineCollection({
    //type: "content": 用于 Markdown/MDX 文件
    //type: "data": 用于 JSON/YAML/TOML 文件
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

// 定义 authors 集合
const authors = defineCollection({
    type: "data",
    schema: z.object({
        name: z.string(),
        avatar: z.string(),
        bio: z.string(),
        social: z.object({
            twitter: z.string().optional(),
            github: z.string().optional(),
        }).optional(),
    }),
});

// Expose your defined collection to Astro
// with the `collections` export
export const collections = { images,flux_images, authors };

// 在 content/config.ts 中，使用 defineCollection 定义了 images 集合
// 使用 Zod（z）定义了数据的结构（schema）：
// 所有数据文件存储在 src/content/images 目录下
// 每个文件都是一个 JSON 文件，包含上述定义的字段

// const images = await getCollection("images");
// 读取 src/content/images 目录下的所有 JSON 文件
// 验证每个文件的数据结构是否符合 schema 定义
// 将所有文件转换为 TypeScript 对象数组
// 提供类型安全的数据访问