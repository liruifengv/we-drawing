import { CREATE_IMAGE_API_URL } from "./const";

export class ImageCreator {
    protected _token: string;

    constructor({ token }: { token: string }) {
        this._token = token;
        if (!this._token) {
            throw new Error("Silicon Flow token is required");
        }
    }

    async createImage(prompt: string): Promise<string[]> {
        try {
            const res = await fetch(CREATE_IMAGE_API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this._token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "stabilityai/stable-diffusion-3-5-large",
                    image_size: "1024x1024",
                    batch_size: 4,
                    // seed: Math.floor(Math.random() * 9999999999),
                    // // 推理步骤
                    // num_inference_steps: Math.floor(Math.random() * 50),
                    // // 用于控制生成图像与给定提示（Prompt）的匹配程度，该值越高，生成的图像越倾向于严格匹配文本提示的内容；该值越低，则生成的图像会更加具有创造性和多样性，可能包含更多的意外元素。
                    // guidance_scale: Math.floor(Math.random() * 20),
                    prompt,
                }),
            }).then((res) => res.json());
            console.log("createImage Result: ", res);
            if (!res.images) {
                throw new Error(`图片生成失败: ${res.message}`);
            }
            return res.images.map((image: { url: string }) => image.url);
        } catch (error) {
            throw new Error(`图片生成失败: ${error.message}`);
        }
    }
}