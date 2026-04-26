import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const allowed = ["image/", "application/pdf", "application/zip", "application/x-zip-compressed", "application/x-zip", "application/octet-stream"];

function getResourceType(mime: string): string {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    return "raw"; // PDFs, ZIPs, and other files
}

export async function POST(req: NextRequest) {
    const { mime, size } = await req.json();

    // validate size limits (default to 10MB - Cloudinary free tier limit)
    const maxImageMB = Number(process.env.MAX_IMAGE_MB) || 10;
    const maxDocMB = Number(process.env.MAX_DOC_MB) || 10;
    const max = mime.startsWith("image/") ? maxImageMB : maxDocMB;
    
    if(!allowed.some(a => mime.startsWith(a))) {
        return NextResponse.json({ error: "File type not supported" }, { status: 400 })
    }
    
    if(size > max * 1024 * 1024) {
        return NextResponse.json({ error: `File too large. Maximum size is ${max}MB` }, { status: 400 })
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER!;
    const resourceType = getResourceType(mime);
    
    // Parameters must be in alphabetical order for signature
    const payload = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha1").update(payload + process.env.CLOUDINARY_API_SECRET).digest("hex");

    return NextResponse.json({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        folder,
        signature,
        resourceType
    })
}