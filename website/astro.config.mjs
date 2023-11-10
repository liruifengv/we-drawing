import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/static";

import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
    site: SITE.website,
    integrations: [tailwind(), sitemap()],
    output: "static",
    adapter: vercel({
        webAnalytics: {
            enabled: true,
        },
    }),
});
