import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import bcrypt from "bcrypt"

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
    password: z.string().optional(),
})

const DAILY_LIMITS = {
    anonymous: 3,
    authenticated: 20,
}

function getTodayDate(): string {
    return new Date().toISOString().split("T")[0] // YYYY-MM-DD
}

export async function POST(req: NextRequest) {
    try {
        // Get base URL from request or env
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host") || "localhost:3000";
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
        
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const parseResult = bodySchema.safeParse(body);
        
        if (!parseResult.success) {
            const firstError = parseResult.error.issues[0];
            return NextResponse.json(
                { error: firstError.message || "Invalid request data" },
                { status: 400 }
            );
        }
        
        const data = parseResult.data;
        const today = getTodayDate();
        
        // Cookie for anonymous users
        let anonId: string | undefined;
        let shouldSetCookie = false;

        // Quota check
        if(!session?.user) {
            // Anonymous quota check
            const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
            anonId = req.cookies.get("anonId")?.value;
            
            if (!anonId) {
                anonId = crypto.randomUUID();
                shouldSetCookie = true;
            }
            
            // Check existing quota first
            const existingQuota = await prisma.anonQuota.findUnique({
                where: { anonId }
            });
            
            // Get today's date for daily reset check
            const quotaDate = existingQuota?.updatedAt.toISOString().split("T")[0];
            const isNewDay = quotaDate !== today;
            
            // If quota exists and it's the same day and limit reached, reject
            if (existingQuota && !isNewDay && existingQuota.uploads >= DAILY_LIMITS.anonymous) {
                return NextResponse.json(
                    { error: "Anonymous upload limit reached (3/day). Sign in for more uploads." },
                    { status: 403 }
                );
            }
            
            // Update or create quota (reset if new day)
            await prisma.anonQuota.upsert({
                where: { anonId },
                update: isNewDay 
                    ? { uploads: 1, ip } // Reset on new day
                    : { uploads: { increment: 1 }, ip },
                create: { anonId, ip, uploads: 1 },
            });
        } else {
            // Authenticated user quota check
            const userId = session.user.id as string;
            
            const quota = await prisma.userQuota.findUnique({
                where: { userId }
            })

            // Reset if new day or create new record
            if (!quota || quota.date !== today) {
                await prisma.userQuota.upsert({
                    where: { userId },
                    update: { uploads: 1, date: today },
                    create: { userId, uploads: 1, date: today },
                })
            } else {
                // Check limit before incrementing
                if (quota.uploads >= DAILY_LIMITS.authenticated) {
                    return NextResponse.json(
                        { error: `Daily upload limit reached (${DAILY_LIMITS.authenticated}/day). Try again tomorrow.` },
                        { status: 403 }
                    );
                }
                
                await prisma.userQuota.update({
                    where: { userId },
                    data: { uploads: { increment: 1 } },
                })
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
        
        // Hash password if provided
        let passwordHash: string | undefined;
        if (data.password && data.password.trim()) {
            passwordHash = await bcrypt.hash(data.password, 10);
        }
        
        const share = await prisma.shareLink.create({
            data: {
                fileId: file.id,
                code,
                expiresAt: new Date(Date.now() + data.expiresInHours * 3600_000),
                downloadLimit: data.downloadLimit,
                uploaderId: userId,
                passwordHash,
            }
        })

        const response = NextResponse.json({ url: `${baseUrl}/d/${share.code}`});
        
        // Set cookie for anonymous users
        if (shouldSetCookie && anonId) {
            response.cookies.set("anonId", anonId, {
                httpOnly: true,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 365, // 1 year
            });
        }
        
        return response;
    } catch (error) {
        console.error("Share API error:", error);
        return NextResponse.json(
            { error: "Failed to create share link" },
            { status: 500 }
        );
    }
}
