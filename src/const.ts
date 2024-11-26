export const BING_URL: string = process.env.BING_URL || "https://www.bing.com";

export const HEADERS: { [key: string]: string } = {
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    referrer: "https://www.bing.com/images/create/",
    origin: "https://www.bing.com",
    "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
};

export const SENTENCE_API = "https://v1.jinrishici.com/all";

export const FLUX_URL = "https://api.siliconflow.cn/v1/images/generations";
export const FLUX_CONFIG = {
    model: "stabilityai/stable-diffusion-3-5-large",
    image_size: "1024x1024",
    batch_size: Math.floor(Math.random() * 4),
    seed: Math.floor(Math.random() * 9999999999),
    num_inference_steps: Math.floor(Math.random() * 100),
    guidance_scale: Math.floor(Math.random() * 100),
};

//1024x1024, 512x1024, 768x512, 768x1024, 1024x576, 576x1024 
//0 < x < 100
//black-forest-labs/FLUX.1-dev
//Pro/black-forest-labs/FLUX.1-schnell
//black-forest-labs/FLUX.1-schnell
//stabilityai/stable-diffusion-3-5-large
