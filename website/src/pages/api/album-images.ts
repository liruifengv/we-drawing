import type { APIRoute } from 'astro';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const GET: APIRoute = async ({ url }) => {
    const page = Number(url.searchParams.get('page') || 1);
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
            Prefix: "images/",
            MaxKeys: PAGE_SIZE,
            StartAfter: page > 1 
                ? `images/page_${page - 1}_last_key` 
                : undefined
        });

        const response = await r2Client.send(command);
        
        const extractTimestampFromKey = (key: string): number => {
            const match = key.match(/images\/(\d+)_/);
            return match ? parseInt(match[1]) : 0;
        };

        const images = response.Contents
            ?.filter(obj => obj.Key?.endsWith('.jpg'))
            .map(obj => ({
                key: obj.Key,
                timestamp: extractTimestampFromKey(obj.Key!),
                url: `https://pub-${import.meta.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${obj.Key}`
            }))
            .sort((a, b) => b.timestamp - a.timestamp) || [];

        return new Response(JSON.stringify({
            images,
            hasMore: response.IsTruncated || false
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error listing R2 objects:", error);
        return new Response(JSON.stringify({
            images: [],
            hasMore: false
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 