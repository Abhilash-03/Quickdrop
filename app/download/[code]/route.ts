import { v2 as cloudinary} from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function GET(_: NextRequest, { params } : { params : Promise<{ code: string }>}) {
    const { code } = await params
    
    const link = await prisma.shareLink.findUnique({
        where: { code },
        include: { file: true },
    })

    if(!link || link.status !== "active") {
        return NextResponse.redirect(new URL("/404", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
    }

    const now = new Date();
    if (link.expiresAt <= now) {
        await expireAndDelete(link);
        return NextResponse.redirect(new URL("/link-expired", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
    }

    // Check download limit before incrementing
    if (link.downloadCount >= link.downloadLimit) {
        await expireAndDelete(link);
        return NextResponse.redirect(new URL("/link-expired", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
    }

    // Fetch file from Cloudinary
    const fileResponse = await fetch(link.file.secureUrl);
    if (!fileResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }

    // Increment download count
    const updated = await prisma.shareLink.update({
        where: { id: link.id },
        data: { downloadCount: { increment: 1 } },
    })

    if(updated.downloadCount >= updated.downloadLimit) {
        // Schedule deletion (don't await to not block response)
        expireAndDelete(link).catch(console.error);
    }

    // Get file as array buffer and return with download headers
    const fileBuffer = await fileResponse.arrayBuffer();
    
    // Sanitize filename for Content-Disposition header
    const safeFilename = link.file.filename.replace(/[^\w\s.-]/g, '_');
    
    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": link.file.mime || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${safeFilename}"`,
            "Content-Length": String(fileBuffer.byteLength),
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    });
}

interface LinkWithFile {
  id: string
  fileId: string
  file: {
    publicId: string
  }
}

async function expireAndDelete(link: LinkWithFile) {
    await prisma.shareLink.update({
        where: { id: link.id },
        data: { status: "expired" },
    })

    await prisma.file.update({
        where: { id: link.fileId},
        data: { deletedAt: new Date()}
    })

    try{
        await cloudinary.uploader.destroy(link.file.publicId)
    } catch (error) {
        console.log("Expire and Delete Link Error: ", error instanceof Error ? error.message : error);
    }
}
