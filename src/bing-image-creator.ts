import { HEADERS, BING_URL } from "./const";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class BingImageCreator {
    /**
     * Image generation by Microsoft Bing
     * @param cookie - All cookie
     */
    protected _cookie: string;
    constructor({ cookie }: { cookie: string }) {
        this._cookie = cookie;

        if (!this._cookie) {
            throw new Error("Bing cookie is required");
        }
    }

    /**
     * Create image
     * @param prompt - The prompt
     * @returns The image links
     */
    async createImage(prompt: string) {
        const encodedPrompt = encodeURIComponent(prompt);
        let formData = new FormData();
        formData.append("q", encodedPrompt);
        formData.append("qa", "ds");
        console.log("Sending request...");
        // rt=3 or rt=4
        const url = `${BING_URL}/images/create?q=${encodedPrompt}&rt=3&FORM=GENCRE`;

        try {
            const { redirect_url, request_id } = await this.fetchRedirectUrl(url, formData);
            return this.fetchResult(encodedPrompt, redirect_url, request_id);
        } catch (e) {
            // retry 1 time
            console.log("retry 1 time");
            return this.fetchRedirectUrl(url, formData)
                .then((res) => {
                    return this.fetchResult(encodedPrompt, res.redirect_url, res.request_id);
                })
                .catch((e) => {
                    throw new Error(`${e.message}`);
                });
        }
    }
    async fetchRedirectUrl(url: string, formData: FormData) {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                cookie: this._cookie,
                ...HEADERS,
            },
            body: formData,
            redirect: "manual", // set to manual to prevent redirect
        });
        if (response.ok) {
            // 200 is failed
            throw new Error("Request failed");
        } else {
            // 302 is success
            const redirect_url = response.headers.get("location").replace("&nfy=1", "");
            const request_id = redirect_url.split("id=")[1];
            return {
                redirect_url,
                request_id,
            };
        }
    }
    async fetchResult(encodedPrompt: string, redirect_url: string, request_id: string) {
        console.log("redirect_url is ", redirect_url);
        console.log("request_id is ", request_id);
        const cookie = this._cookie;
        try {
            await fetch(`${BING_URL}${redirect_url}`, {
                method: "GET",
                mode: "cors",
                credentials: "include",
                headers: {
                    cookie,
                    ...HEADERS,
                },
            });
        } catch (e) {
            throw new Error(`Request redirect_url failed" ${e.message}`);
        }

        const getResultUrl = `${BING_URL}/images/create/async/results/${request_id}?q=${encodedPrompt}`;
        const start_wait = Date.now();
        let result = "";
        while (true) {
            console.log("Waiting for result...");
            if (Date.now() - start_wait > 200000) {
                throw new Error("Timeout");
            }

            await sleep(1000);
            result = await this.getResults(getResultUrl);
            if (result) {
                break;
            }
        }
        return this.parseResult(result);
    }
    /**
     * Get the result
     * @param getResultUrl - The result url
     * @returns The result
     */
    async getResults(getResultUrl: string) {
        const response = await fetch(getResultUrl, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                cookie: this._cookie,
                ...HEADERS,
            },
        });
        if (response.status !== 200) {
            throw new Error("Bad status code");
        }
        const content = await response.text();
        if (!content || content.includes("errorMessage")) {
            return null;
        } else {
            return content;
        }
    }
    /**
     * Parse the result
     * @param result - The result
     * @returns The image links
     */
    parseResult(result: string) {
        console.log("Parsing result...");
        // Use regex to search for src=""
        const regex = /src="([^"]*)"/g;
        const matches = [...result.matchAll(regex)].map((match) => match[1]);
        console.log("Found", matches.length, "images");
        // # Remove size limit
        const normal_image_links = matches.map((link) => {
            return link.split("?w=")[0];
        });
        console.log("normal_image_links", normal_image_links);
        // Remove Bad Images(https://r.bing.com/rp/xxx)
        const safe_image_links = normal_image_links
          .filter((link) => !/r.bing.com\/rp/i.test(link))
          .filter((link) => !/rp/i.test(link))
          .filter((link) => link.startsWith("http"));
        safe_image_links.length !== normal_image_links.length && console.log("Detected & Removed bad images");
        console.log("safe_image_links", safe_image_links);
        // Remove duplicates
        const unique_image_links = [...new Set(safe_image_links)];
        // No images
        if (unique_image_links.length === 0) {
            throw new Error("error_no_images");
        }
        return unique_image_links;
    }
}
