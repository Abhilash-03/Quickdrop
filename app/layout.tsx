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
    default: "QuickDrop - Fast & Secure File Sharing",
    template: "%s | QuickDrop",
  },
  description: "Share files instantly with expiring links. Upload, share, and auto-delete - simple, fast, and secure. No signup required.",
  keywords: ["file sharing", "secure upload", "expiring links", "file transfer", "quick share", "temporary files", "auto-delete"],
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
    title: "QuickDrop - Fast & Secure File Sharing",
    description: "Share files instantly with expiring links. Upload, share, and auto-delete - simple, fast, and secure.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickDrop - Fast & Secure File Sharing",
    description: "Share files instantly with expiring links. Upload, share, and auto-delete - simple, fast, and secure.",
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
