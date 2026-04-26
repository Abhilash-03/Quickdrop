import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By using QuickDrop, you agree to these terms. If you don&apos;t agree, please don&apos;t use the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Service Description</h2>
            <p className="text-muted-foreground">
              QuickDrop is a temporary file sharing service. Files are automatically deleted after expiration 
              or when download limits are reached.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Acceptable Use</h2>
            <p className="text-muted-foreground">
              You agree not to upload:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Illegal content or materials violating any laws</li>
              <li>Malware, viruses, or harmful software</li>
              <li>Copyrighted content you don&apos;t have rights to share</li>
              <li>Content that violates others&apos; privacy</li>
              <li>Spam or bulk unsolicited files</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Limits</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Anonymous users: 3 uploads per day</li>
              <li>Registered users: 20 uploads per day</li>
              <li>Maximum file size: 10MB</li>
              <li>Maximum expiration: 30 days</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">No Warranty</h2>
            <p className="text-muted-foreground">
              QuickDrop is provided &quot;as is&quot; without warranties. We don&apos;t guarantee file availability, 
              uptime, or that files won&apos;t be deleted early due to technical issues.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              We are not liable for any damages arising from file loss, service interruptions, 
              or misuse of shared links.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Account Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to terminate accounts or remove files that violate these terms 
              without notice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms at any time. Continued use of QuickDrop after changes 
              constitutes acceptance of new terms.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
