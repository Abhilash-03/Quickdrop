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
              QuickDrop offers two file sharing methods:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Drop (Cloud Upload):</strong> Files are uploaded to our cloud storage and automatically deleted after expiration or when download limits are reached.</li>
              <li><strong>Flash (P2P Transfer):</strong> Files are transferred directly between devices using peer-to-peer technology. Files never touch our servers - they go directly from sender to receiver.</li>
            </ul>
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
            <h3 className="text-lg font-medium mt-4">Drop (Cloud Upload)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Anonymous users: 3 uploads per day</li>
              <li>Registered users: 20 uploads per day</li>
              <li>Maximum file size: 10MB</li>
              <li>Supported formats: Images (JPG, PNG, GIF, WebP), PDFs, and ZIP files</li>
              <li>Maximum expiration: 30 days</li>
            </ul>
            <h3 className="text-lg font-medium mt-4">Flash (P2P Transfer)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Maximum file size: 1GB</li>
              <li>Any file type supported</li>
              <li>Room codes expire after 10 minutes</li>
              <li>Both devices must be online during transfer</li>
              <li>No daily limits - transfer as many files as you want</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">No Warranty</h2>
            <p className="text-muted-foreground">
              QuickDrop is provided &quot;as is&quot; without warranties. We don&apos;t guarantee file availability, 
              uptime, or that files won&apos;t be deleted early due to technical issues.
            </p>
            <p className="text-muted-foreground">
              For Flash P2P transfers, connection success depends on network conditions and device compatibility. 
              We cannot guarantee successful connections across all network configurations (e.g., strict firewalls, 
              carrier-grade NAT, or certain mobile networks).
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
            <h2 className="text-xl font-semibold">Account Deletion by User</h2>
            <p className="text-muted-foreground">
              You may delete your account at any time from your profile settings. Upon deletion:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All your files will be permanently deleted from our servers</li>
              <li>All active share links will become invalid</li>
              <li>Your account information will be removed from our database</li>
              <li>This action cannot be undone</li>
            </ul>
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
