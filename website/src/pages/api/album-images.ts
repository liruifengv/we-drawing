import type { APIRoute } from 'astro';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const GET: APIRoute = async ({ url }) => {
    const PAGE_SIZE = 12;

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
            MaxKeys: PAGE_SIZE,
        });

        const response = await r2Client.send(command);
        
        const images = response.Contents
            ?.filter(obj => 
                obj.Key && 
                // obj.Key.endsWith('.jpg') && 
                !obj.Key.includes('_$flaredrive$/')
            )
            .map(obj => ({
                key: obj.Key,
                url: `https://p.robus.cloudns.be/raw/${obj.Key}`,
                lastModified: obj.LastModified
            }))
            .sort((a, b) => 
                new Date(b.lastModified!).getTime() - 
                new Date(a.lastModified!).getTime()
            ) || [];

        return new Response(JSON.stringify({
            images,
            hasMore: response.IsTruncated || false
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("列出 R2 对象时发生错误:", error);
        return new Response(JSON.stringify({
            images: [],
            hasMore: false,
            error: error instanceof Error ? error.message : "未知错误"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 