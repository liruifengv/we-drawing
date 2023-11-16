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
        const cookie = this._cookie;
        const encodedPrompt = encodeURIComponent(prompt);
        let formData = new FormData();
        formData.append("q", encodedPrompt);
        formData.append("qa", "ds");
        console.log("Sending request...");
        // rt=3 or rt=4
        const url = `${BING_URL}/images/create?q=${encodedPrompt}&rt=3&FORM=GENCRE`;

        return fetch(url, {
            headers: {
                cookie,
                ...HEADERS,
            },
            body: formData,
            method: "POST",
            mode: "cors",
            redirect: "manual", // set to manual to prevent redirect
        }).then(async (res) => {
            if (res.ok) {
                // 200 is failed
                throw new Error("Request failed");
            } else {
                // 302 is success
                const redirect_url = res.headers.get("location").replace("&nfy=1", "");
                const request_id = redirect_url.split("id=")[1];
                console.log("redirect_url", redirect_url);
                console.log("request_id", request_id);
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
        });
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
        // # Remove size limit
        const normal_image_links = matches.map((link) => {
            return link.split("?w=")[0];
        });
        // Remove duplicates
        const unique_image_links = [...new Set(normal_image_links)];
        const bad_images = [
            "https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png",
            "https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg",
        ];
        for (const img of unique_image_links) {
            if (bad_images.includes(img)) {
                throw new Error("Bad images");
            }
        }
        // No images
        if (unique_image_links.length === 0) {
            throw new Error("error_no_images");
        }
        return unique_image_links;
    }
}
