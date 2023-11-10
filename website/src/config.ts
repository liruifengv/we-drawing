import type { Site, SocialObjects, OG_Type } from "./types";

export const SITE: Site = {
    website: "https://daily-poetry-image.vercel.app/",
    author: "liruifengv",
    title: "Daily Poetry Images",
    desc: "每天一句中国古诗词，生成 AI 图片 Powered by Bing DALL-E-3.",
};

export const SOCIALS: SocialObjects = [
    {
        name: "Github",
        href: "https://github.com/liruifengv",
        linkTitle: `liruifengv's Github`,
        active: true,
    },
    {
        name: "Mail",
        href: "mailto:liruifeng1024@gmail.com",
        linkTitle: `Send an email to liruifengv`,
        active: true,
    },
    {
        name: "Twitter",
        href: "https://twitter.com/liruifengv",
        linkTitle: `liruifengv's Twitter`,
        active: true,
    },
];

export const OG: OG_Type = {
    emojiType: "twemoji",
    // ogImage: "astropaper-og.jpg",
};
