import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthModal } from "@/components/auth-modal";
import { Toaster } from "@/components/ui/sonner";
import { GlobalDropZone } from "@/components/global-drop-zone";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quickdrop-flash.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QuickDrop - Instant File Sharing | P2P & Cloud Transfer",
    template: "%s | QuickDrop",
  },
  description: "Share files instantly via P2P or cloud. Flash mode for real-time device-to-device transfers, expiring links for cloud sharing. No signup required, end-to-end encrypted.",
  keywords: [
    "file sharing",
    "P2P file transfer",
    "peer to peer",
    "WebRTC file sharing",
    "secure upload",
    "expiring links",
    "temporary file sharing",
    "instant file transfer",
    "send large files",
    "encrypted file sharing",
    "no signup file share",
    "auto-delete files",
    "QR code file transfer",
    "device to device transfer"
  ],
  authors: [{ name: "QuickDrop" }],
  creator: "QuickDrop",
  publisher: "QuickDrop",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "QuickDrop",
    title: "QuickDrop - Instant File Sharing | P2P & Cloud Transfer",
    description: "Share files instantly via P2P or cloud. Flash mode for real-time transfers, expiring links for secure sharing. No signup required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickDrop - Instant File Sharing | P2P & Cloud",
    description: "Share files instantly via P2P or cloud. Flash mode for real-time transfers, expiring links for secure sharing. No signup required.",
    creator: "@quickdrop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <GlobalDropZone />
            </QueryProvider>
            <AuthModal />
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
