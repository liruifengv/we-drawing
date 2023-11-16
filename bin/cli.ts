import { getImageBySentence } from "../src/get-up";
import type { Response } from "../src/types";
import path from "path";
import fs from "fs";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

async function init() {
    const cwd = process.cwd();

    const argv = require("minimist")(process.argv.slice(2));

    if (argv.cookie) {
        try {
            const res: Response = await getImageBySentence(argv.cookie);
            console.log("Create Successful: ", res);

            const outputPath = path.join(cwd, "website/public");

            const imagesPath = path.join(outputPath, "images");
            if (!fs.existsSync(imagesPath)) {
                fs.mkdirSync(imagesPath);
            }

            // 在 images 目录下，创建一个以时间戳命名的文件夹，将图片放入其中
            const imagesFolderName = Date.now().toString();
            const imagesFolderPath = path.join(imagesPath, imagesFolderName);
            if (!fs.existsSync(imagesFolderPath)) {
                fs.mkdirSync(imagesFolderPath);
            }

            // 将图片放入 images 目录下的文件夹中
            res.images.forEach((image, index) => {
                // images 中是网络url，请求图片，将图片保存到 images 目录下的文件夹中
                const imageFileName = `${index}.jpg`;
                const imageFilePath = path.join(imagesFolderPath, imageFileName);

                // 下载图片
                fetch(image).then((res) => {
                    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
                    // @ts-ignore
                    pipeline(res.body, fs.createWriteStream(imageFilePath)).catch((e) => {
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

            const contentPath = path.join(cwd, "website/src/content/images");

            const contentFile = path.join(contentPath, `${imagesFolderName}.json`);

            fs.writeFileSync(contentFile, JSON.stringify(outputData));

            setTimeout(() => {
                // 为了让图片下载完毕，再退出进程
                process.exit(0);
            }, 5000);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    } else {
        throw new Error("Please provide a cookie using the --cookie argument");
    }
}

init().catch((e) => {
    console.error(e);
});
