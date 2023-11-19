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
