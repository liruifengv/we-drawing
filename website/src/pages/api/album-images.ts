import type { APIRoute } from 'astro';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// 定义一个更具体的错误接口
interface DetailedError extends Error {
    name: string;
    message: string;
    $metadata?: any;
}

export const GET: APIRoute = async ({ url }) => {
    const page = Number(url.searchParams.get('page') || 1);
    const PAGE_SIZE = 12;

    console.log('Album Images API Called');
    console.log('Page:', page);
    console.log('Cloudflare Account ID:', import.meta.env.CLOUDFLARE_ACCOUNT_ID);
    console.log('Bucket Name:', import.meta.env.CLOUDFLARE_BUCKET_NAME);

    const r2Client = new S3Client({
        region: "auto", 
        endpoint: `https://${import.meta.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: import.meta.env.CLOUDFLARE_ACCESS_KEY_ID,
            secretAccessKey: import.meta.env.CLOUDFLARE_SECRET_ACCESS_KEY
        },
        forcePathStyle: true
    });

    try {
        const command = new ListObjectsV2Command({
            Bucket: import.meta.env.CLOUDFLARE_BUCKET_NAME,
            Prefix: "images/",
            MaxKeys: PAGE_SIZE,
            StartAfter: page > 1 
                ? `images/page_${page - 1}_last_key` 
                : undefined
        });

        console.log('Sending R2 List Objects Command');

        const response = await r2Client.send(command);
        
        console.log('R2 Response Metadata:', JSON.stringify(response.$metadata, null, 2));
        console.log('Total Objects Count:', response.Contents?.length);
        console.log('Is Truncated:', response.IsTruncated);

        response.Contents?.forEach((obj, index) => {
            console.log(`Object ${index + 1} Key:`, obj.Key);
        });

        const images = response.Contents
            ?.map(obj => ({
                key: obj.Key,
                url: `https://p.robus.cloudns.be/raw/${obj.Key}`,
                lastModified: obj.LastModified
            }))
            .sort((a, b) => 
                new Date(b.lastModified!).getTime() - 
                new Date(a.lastModified!).getTime()
            ) || [];

        console.log('Processed Images Count:', images.length);

        return new Response(JSON.stringify({
            images,
            hasMore: response.IsTruncated || false
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: unknown) {
        // 使用类型保护
        if (error instanceof Error) {
            console.error("完整错误对象:", error);
            console.error("错误名称:", error.name);
            console.error("错误消息:", error.message);

            // 检查是否有 $metadata 属性
            const detailedError = error as DetailedError;
            if (detailedError.$metadata) {
                console.error("AWS Metadata:", JSON.stringify(detailedError.$metadata, null, 2));
            }

            return new Response(JSON.stringify({
                images: [],
                hasMore: false,
                error: error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 处理非 Error 类型的错误
        console.error("未知错误:", error);
        return new Response(JSON.stringify({
            images: [],
            hasMore: false,
            error: "未知错误"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 