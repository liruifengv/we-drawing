import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
    site: SITE.website,
    integrations: [tailwind(), sitemap()],
    output: "static",
});

//这是框架的一个固定约定：
// src/pages/ 用于页面文件
// src/layouts/ 用于布局文件
// src/components/ 用于组件文件
// src/content/ 用于内容集合


// 由于我们在 astro.config.mjs 中设置了 output: "static"，这是静态生成（Static Site Generation, SSG）模式。
// 这意味着 Astro 将在构建时生成所有页面，然后在部署时复制这些生成的文件到指定路径。

// 在 astro.config.mjs 中设置 output: "server"
// 这样页面就会在用户访问时动态生成
// 但这需要一个 Node.js 服务器来运行

// 开发模式（pnpm run dev）：
// 使用 Astro 的开发服务器
// 会在内存中实时编译和执行代码
// 也会调用 getStaticPaths()，但是是在内存中动态执行
// 支持热更新（Hot Module Replacement）
// 不会生成实际的静态文件
// 构建模式（pnpm run build）：
// 生成生产环境的静态文件
// 会调用 getStaticPaths() 并将结果保存为静态 HTML
// 输出到 dist 目录
// 这些文件可以直接部署到静态服务器
// 为什么 Astro 知道要调用 getStaticPaths()？
// 这是 Astro 的文件约定（File Convention）
// 当 Astro 发现一个动态路由文件（带 [参数] 的文件名）
// 它会自动寻找该文件中的 getStaticPaths 导出函数
// 这个函数必须返回一个包含 params 的数组，用于生成路由