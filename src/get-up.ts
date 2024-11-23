import "dotenv/config";
import { SENTENCE_API } from "./const";

import { BingImageCreator } from "./bing-image-creator";
import { FluxImageCreator } from "./flux-image-creator";
import type { SentenceResponse, Response } from "./types";

/**
 * Get the sentence
 * @returns SentenceResponse
 * @throws {Error} The error
 **/
async function getSentence(): Promise<SentenceResponse> {
    try {
        const res = await fetch(SENTENCE_API);
        const data: SentenceResponse = await res.json();
        return data;
    } catch (e) {
        throw new Error("Request Sentence failed: ", e);
    }
}

async function getImageBySentence(cookie: string): Promise<Response> {
    const bingImageCreator = new BingImageCreator({
        cookie: cookie,
    });

    const res = await getSentence();
    console.log("getSentence Result: ", res);

    const prompt = `${res.content}, textless`;
    try {
        const images = await bingImageCreator.createImage(prompt);
        return {
            images,
            content: res.content,
            origin: res.origin,
            author: res.author,
            category: res.category,
        };
    } catch (error) {
        throw new Error(`Bing Image create failed: ${error.message}`);
    }
}


async function getFluxImageBySentence(token: string): Promise<Response> {
    const fluxImageCreator = new FluxImageCreator({
        token: token,
    });

    const res = await getSentence();
    console.log("获取句子结果: ", res);

    const prompt = `${res.content}, textless`;
    try {
        const images = await fluxImageCreator.createImage(prompt);
        return {
            images,
            content: res.content,
            origin: res.origin,
            author: res.author,
            category: res.category,
        };
    } catch (error) {
        throw new Error(`图片生成失败: ${error.message}`);
    }
}

export { getImageBySentence, getFluxImageBySentence };
