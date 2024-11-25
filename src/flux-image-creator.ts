import { HEADERS, BING_URL } from "./const";
import { FLUX_URL, FLUX_CONFIG } from "./const";
import * as fs from "fs";
import * as path from "path";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


export class FluxImageCreator {
    protected _token: string;

    constructor({ token }: { token: string }) {
        this._token = token;
        if (!this._token) {
            throw new Error("Silicon Flow token is required");
        }
    }

    /**
     * 创建图片
     * @param prompt - 提示词
     * @param negative_prompt - 负面提示词
     * @returns 图片URL数组
     */
    async createImage(prompt: string, negative_prompt: string = "") {
        console.log("正在发送4个并发请求...");

        try {
            // Create an array of 4 identical requests
            const requests = Array(4).fill(null).map(() =>
                fetch(FLUX_URL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this._token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...FLUX_CONFIG,
                        batch_size: Math.floor(Math.random() * 4) + 1,
                        seed: Math.floor(Math.random() * 9999999999) + 1,
                        num_inference_steps: Math.floor(Math.random() * 100) + 1,
                        guidance_scale: Math.floor(Math.random() * 100) + 1,
                        prompt,
                        negative_prompt,
                    }),
                })
            );

            // Execute all requests in parallel
            const responses = await Promise.all(requests);

            // 检查是否所有请求都失败
            const allFailed = responses.every(response => !response.ok);
            if (allFailed) {
                throw new Error(`所有请求都失败了！`);
            }

            // Check if any response failed
            responses.forEach((response, index) => {
                console.log(index, response.ok)
            });

            // Parse all responses
            const results = await Promise.all(responses.filter(response => response.ok).map(response => response.json()));

            // Combine all image URLs from all responses
            const imageUrls = results.flatMap(data =>
                data.images.map((img: { url: string }) => img.url)
            );

            return imageUrls;
        } catch (error) {
            throw new Error(`图片生成失败: ${error.message}`);
        }
    }
}
