import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config";

export async function GET() {
  const images = await getCollection("images");
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: images.map((image) => ({
      link: `images/${image.id}`,
      title: image.data.content,
      description: `今天诗词：${image.data.content}`,
      pubDate: new Date(image.data.date),
    })),
  });
}
