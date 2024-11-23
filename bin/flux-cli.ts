import { getFluxImageBySentence } from "../src/get-up";
import type { Response } from "../src/types";
import path from "path";
import fs from "fs";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

async function init() {
    const cwd = process.cwd();
    const argv = require("minimist")(process.argv.slice(2));
    
    if (argv.token) {
        try {
            // 获取图片并处理
            const res: Response = await getFluxImageBySentence(argv.token);
            console.log("Create Successful: ", res);
            // 创建目录结构
            const outputPath = path.join(cwd, "website/public");
            const imagesPath = path.join(outputPath, "flux_images");
            if (!fs.existsSync(imagesPath)) {
                fs.mkdirSync(imagesPath);
            }

            // 在 images 目录下，创建一个以时间戳命名的文件夹，将图片放入其中
            const imagesFolderName = Date.now().toString();
            const imagesFolderPath = path.join(imagesPath, imagesFolderName);
            if (!fs.existsSync(imagesFolderPath)) {
                fs.mkdirSync(imagesFolderPath);
            }

            //遍历图片列表，为每张图片创建文件名并发起下载请求。
            res.images.forEach((image, index) => {
                const imageFileName = `${index}.jpg`;
                const imageFilePath = path.join(imagesFolderPath, imageFileName);
                
                // 下载图片
                fetch(image).then((response) => {
                    if (!response.ok) throw new Error(`下载图片失败: ${response.statusText}`);
                    // 使用 fetch 获取图片数据，然后用 pipeline 将数据流写入文件。
                    // @ts-ignore
                    pipeline(response.body, fs.createWriteStream(imageFilePath)).catch((e) => {
                        console.error("Something went wrong while saving the image", e);
                    });
                });
            });

            const options = { timeZone: "Asia/Shanghai", hour12: false };
            const outputData = {
                ...res,
                date: new Date().toLocaleString("zh-CN", options),
                localImagesPath: imagesFolderName,
            };

            // 保存元数据
            const contentPath = path.join(cwd, "website/src/content/flux_images");
            // 创建包含图片信息和下载时间等的 JSON 文件。
            const contentFile = path.join(contentPath, `${imagesFolderName}.json`);
            // 使用 fs.writeFileSync 同步地写入文件，因为这是一个相对较小的数据量。
            fs.writeFileSync(contentFile, JSON.stringify(outputData));

            // 为了确保所有图片下载完成，设置了一个5秒的延迟再退出程序。
            setTimeout(() => {
                // 为了让图片下载完毕，再退出进程
                process.exit(0);
            }, 5000);
        } catch (error) {
            console.error("Error:", error);
            process.exit(1);
        }
    } else {
        console.error("Please provide either --cookie for Bing or --token for Flux");
        process.exit(1);
    }
}

// 启动 init 函数，并捕获其可能抛出的任何错误。
init().catch((e) => {
    console.error(e);
    process.exit(1);
});

// 异步操作: 使用 async/await 来处理异步操作，使代码更易读。
// 流和管道: 使用 stream.pipeline 来高效地处理大文件。
// 命令行参数处理: 通过 minimist 解析命令行参数，增加程序的灵活性。
// 错误处理: 通过 try-catch 块捕获并处理可能的错误，提供良好的用户反馈。