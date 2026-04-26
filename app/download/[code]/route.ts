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

    if(!link || link.status !== "active") return NextResponse.redirect("/404");

    const now = new Date();
    if (link.expiresAt <= now) {
        await expireAndDelete(link);
        return NextResponse.redirect("/link-expired");
    }

    const updated = await prisma.shareLink.update({
        where: { id: link.id },
        data: { downloadCount: { increment: 1 } },
    })

    if(updated.downloadCount >= updated.downloadLimit) {
        await expireAndDelete(link);
    }

    // Redirect user to cloudinary file (fast CDN)
    return NextResponse.redirect(link.file.secureUrl, 302);
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
