# Astro 学习笔记

## 1. 目录约定（Convention）

Astro 框架有固定的目录约定：
- `src/pages/` - 用于页面文件
- `src/layouts/` - 用于布局文件
- `src/components/` - 用于组件文件
- `src/content/` - 用于内容集合

## 2. 动态路由

### 文件命名约定
- 使用方括号 `[参数]` 创建动态路由
- 例如：`src/pages/images/[slug].astro` 会匹配 `/images/任何值`

### getStaticPaths 函数
```typescript
export async function getStaticPaths() {
  const images = await getCollection("images")
  return images.map(img => ({
    params: { slug: img.data.localImagesPath }, // 定义路由参数
    props: img,  // 传递给页面的数据
  }));
}
```

- Astro 通过文件约定自动识别和调用 `getStaticPaths`
- 函数必须返回包含 `params` 的数组用于生成路由
- `params` 对应文件名中的 `[参数]`

## 3. 构建模式

### 开发模式（pnpm run dev）
- 使用 Astro 的开发服务器
- 在内存中实时编译和执行代码
- 动态执行 `getStaticPaths()`
- 支持热更新（Hot Module Replacement）
- 不生成实际的静态文件
- 适合开发和调试

### 构建模式（pnpm run build）
- 生成生产环境的静态文件
- 执行 `getStaticPaths()` 并保存为静态 HTML
- 输出到 `dist` 目录
- 文件可直接部署到静态服务器
- 适合生产环境

## 4. 输出模式

### 静态生成（SSG）
```javascript
// astro.config.mjs
export default defineConfig({
    output: "static"  // 默认模式
})
```
- 在构建时生成所有页面
- 生成静态 HTML 文件
- 不需要服务器
- 部署简单，性能好

### 服务器模式（SSR）
```javascript
// astro.config.mjs
export default defineConfig({
    output: "server"
})
```
- 在用户访问时动态生成页面
- 需要 Node.js 服务器
- 适合需要实时数据的应用

## 5. 内容集合

### 目录结构
```
src/content/
├── images/     # 图片集合
└── authors/    # 作者集合
```

### 使用方法
```typescript
import { getCollection } from "astro:content";

// 获取集合数据
const images = await getCollection("images")
```

- 集合必须在 `src/content` 目录下
- 每个集合需要对应的文件夹
- 支持类型安全和模式验证
