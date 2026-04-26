import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Information We Collect</h2>
            <p className="text-muted-foreground">
              QuickDrop is designed with privacy in mind. We collect minimal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Files you upload:</strong> Stored temporarily and automatically deleted after expiration</li>
              <li><strong>Account information:</strong> Email and name if you choose to sign up</li>
              <li><strong>Anonymous identifiers:</strong> Browser cookies to track upload limits for anonymous users</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide file sharing functionality</li>
              <li>To enforce upload limits and prevent abuse</li>
              <li>To send share links and download notifications</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Data Retention</h2>
            <p className="text-muted-foreground">
              Files are automatically deleted when they expire or reach their download limit. 
              We do not keep copies of your files after deletion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Cloudinary:</strong> For secure file storage and delivery</li>
              <li><strong>Authentication providers:</strong> Google and GitHub for optional sign-in</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Your Rights</h2>
            <p className="text-muted-foreground">
              You can delete your account and all associated data at any time from your profile settings.
              Anonymous uploads are automatically deleted based on expiration settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              For privacy concerns, please reach out to us through the application.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
