"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileUploader } from "@/components/file-uploader"
import { ShareLinkDialog } from "@/components/share-link-dialog"
import { Shield, Clock, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Share Files <span className="text-primary">Instantly</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Upload, share, and auto-delete. Simple, fast, and secure file sharing with expiring links.
              </p>
            </div>

            {/* Upload Area */}
            <div className="w-full max-w-xl mt-8">
              <FileUploader />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 border-t">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Upload directly to CDN for instant sharing with anyone, anywhere.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Auto-Expiring Links</h3>
              <p className="text-sm text-muted-foreground">
                Set expiration time and download limits. Files auto-delete when done.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Anonymous uploads supported. No account required to share files.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ShareLinkDialog />
    </div>
  )
}
