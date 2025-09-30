import { CREATE_IMAGE_API_URL } from "./const";

export class ImageCreator {
    protected _token: string;

    constructor({ token }: { token: string }) {
        this._token = token;
        if (!this._token) {
            throw new Error("token is required");
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
                    model: "Kwai-Kolors/Kolors",
                    image_size: "1024x1024",
                    batch_size: 4,
                    num_inference_steps: 50,
                    seed: 1,
                    guidance_scale: 7.5,
                    prompt,
                }),
            }).then((res) => res.json());
            console.log("createImage Result: ", res);
            if (!res.images) {
                throw new Error(`图片生成失败: ${res.message}`);
            }
            return res.images.map((image: { url: string }) => image.url);
        } catch (error) {
          console.log("===error", error)
            throw new Error(`图片生成失败: ${error.message}`);
        }
    }
}
