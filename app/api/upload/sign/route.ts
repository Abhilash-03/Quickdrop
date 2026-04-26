import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const allowed = ["image/", "application/pdf", "application/zip"];

export async function POST(req: NextRequest) {
    const { mime, size } = await req.json();

    // validate size limits
    const max = mime.startsWith("image/") ? Number(process.env.MAX_IMAGE_MB) : Number(process.env.MAX_DOC_MB);
    if(!allowed.some(a => mime.startsWith(a)) || size > max * 1024 * 1024) {
        return NextResponse.json({ error: "Invalid file" }, { status: 400 })
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER!;
    const payload = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha1").update(payload + process.env.CLOUDINARY_API_SECRET).digest("hex");

    return NextResponse.json({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        folder,
        signature
    })
}