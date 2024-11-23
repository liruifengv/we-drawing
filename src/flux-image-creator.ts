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
        console.log("正在发送请求...");
        
        try {
            const response = await fetch(FLUX_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this._token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...FLUX_CONFIG,
                    prompt,
                    negative_prompt,
                }),
            });

            if (!response.ok) {
                throw new Error(`请求失败: ${response.statusText}`);
            }

            const data = await response.json();
            const imageUrls = data.images.map((img: { url: string }) => img.url);

            return imageUrls;
        } catch (error) {
            throw new Error(`图片生成失败: ${error.message}`);
        }
    }
}
