import { getImageBySentence } from "../src/get-up";
import type { Response } from "../src/types";
import path from "path";
import fs from "fs";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

async function init() {
    // process.cwd() 是 Node.js 中 process 对象的一个方法，用于获取当前工作目录（Current Working Directory）的路径。
    // 这行代码会返回一个字符串，表示当前 Node.js 脚本所在的目录的绝对路径。
    // 这个路径是当你启动 Node.js 进程时所在的目录，而不是脚本文件的所在目录（除非你直接在脚本所在目录运行它）。
    const cwd = process.cwd();
    // 3. 获取命令行参数
    // 这里使用 minimist 解析命令行参数。process.argv 包含了启动脚本时传递的参数，slice(2) 去掉了前两个默认参数（node 和脚本路径）。
    const argv = require("minimist")(process.argv.slice(2));
    // 4. 检查是否提供了 cookie
    if (argv.cookie) {
        try {
            // 5. 获取图片并处理
            const res: Response = await getImageBySentence(argv.cookie);
            console.log("Create Successful: ", res);
            // 6. 创建目录结构
            // path.join: 这是 Node.js path 模块提供的一个方法，用于将多个路径片段连接成一个标准化的路径字符串。path.join 会根据当前操作系统的路径分隔符（在 Unix/Linux 是 /，在 Windows 是 \）来正确地连接这些片段。
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
            //遍历图片列表，为每张图片创建文件名并发起下载请求。
            // 将图片放入 images 目录下的文件夹中
            res.images.forEach((image, index) => {
                // images 中是网络url，请求图片，将图片保存到 images 目录下的文件夹中
                const imageFileName = `${index}.jpg`;
                const imageFilePath = path.join(imagesFolderPath, imageFileName);

                // 下载图片
                fetch(image).then((res) => {
                    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
                    // 使用 fetch 获取图片数据，然后用 pipeline 将数据流写入文件。
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
            // 8. 保存元数据
            const contentPath = path.join(cwd, "website/src/content/images");
            // 创建包含图片信息和下载时间等的 JSON 文件。
            const contentFile = path.join(contentPath, `${imagesFolderName}.json`);
            // 使用 fs.writeFileSync 同步地写入文件，因为这是一个相对较小的数据量。
            fs.writeFileSync(contentFile, JSON.stringify(outputData));

            // 为了确保所有图片下载完成，设置了一个5秒的延迟再退出程序。
            setTimeout(() => {
                // 为了让图片下载完毕，再退出进程
                process.exit(0);
            }, 5000);
        } catch (e) {
            // 如果在执行过程中遇到错误，打印错误信息并以错误状态码退出。
            console.error(e);
            process.exit(1);
        }
    } else {
        throw new Error("Please provide a cookie using the --cookie argument");
        // console.log("No cookie provided, skipping image generation");
        // return; // 直接返回，不抛出错误
    }
}
// 启动 init 函数，并捕获其可能抛出的任何错误。
init().catch((e) => {
    console.error(e);
});

// 异步操作: 使用 async/await 来处理异步操作，使代码更易读。
// 流和管道: 使用 stream.pipeline 来高效地处理大文件。
// 命令行参数处理: 通过 minimist 解析命令行参数，增加程序的灵活性。
// 错误处理: 通过 try-catch 块捕获并处理可能的错误，提供良好的用户反馈。