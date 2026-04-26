import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

const bodySchema = z.object({
    filename: z.string(),
    mime: z.string(),
    size: z.number(),
    secureUrl: z.url(),
    publicId: z.string(),
    expiresInHours: z.number().min(1).max(720),
    downloadLimit: z.number().min(1).max(100),
    checksum: z.string(),
    isAnonymous: z.boolean(),
})

// helper
function getOrSetAnon(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
    const cookies = req.cookies;
    let anonId = cookies.get("anonId")?.value;
    if(!anonId) {
        anonId = crypto.randomUUID();
    }
    const res = NextResponse.next();
    res.cookies.set("anonId", anonId!, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
    return { anonId: anonId!, ip };
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    const data = bodySchema.parse(await req.json());

    // Anonymous quota check
    if(!session?.user) {
        const { anonId, ip } = getOrSetAnon(req);
        const quota = await prisma.anonQuota.upsert({
            where: { anonId },
            update: { uploads: {increment: 1}, ip},
            create: {anonId, ip, uploads: 1},
        })

        if(quota.uploads > 3) {
            return NextResponse.json({ error: "Anonymous upload limit reached"}, { status: 403 });
        }
    } 

    const userId = session?.user?.id ?? undefined;
    const file = await prisma.file.create({
        data: {
            filename: data.filename,
            mime: data.mime,
            size: data.size,
            checksum: data.checksum,
            storage: "cloudinary",
            publicId: data.publicId,
            secureUrl: data.secureUrl,
            uploaderId: userId,
            isAnonymous: !userId
        }
    })

    const code = nanoid(10);
    const share = await prisma.shareLink.create({
        data: {
            fileId: file.id,
            code,
            expiresAt: new Date(Date.now() + data.expiresInHours * 3600_000),
            downloadLimit: data.downloadLimit,
            uploaderId: userId
        }
    })

    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_BASE_URL}/d/${share.code}`});

}
