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
              <li><strong>Files you upload (Drop):</strong> Stored temporarily and automatically deleted after expiration</li>
              <li><strong>Account information:</strong> Email and name if you choose to sign up</li>
              <li><strong>Anonymous identifiers:</strong> Browser cookies to track upload limits for anonymous users</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Flash P2P Transfers</h2>
            <p className="text-muted-foreground">
              When using Flash (P2P) transfers, your files are sent directly between devices using WebRTC technology. 
              This means:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>No server storage:</strong> Your files never pass through or are stored on our servers</li>
              <li><strong>Direct connection:</strong> Files transfer directly from sender to receiver</li>
              <li><strong>Encrypted transfer:</strong> WebRTC connections are encrypted by default (DTLS)</li>
              <li><strong>Temporary codes:</strong> Room codes are only used to establish connection and expire after 10 minutes</li>
            </ul>
            <p className="text-muted-foreground">
              We use a signaling server (PeerJS) only to help devices discover each other. Once connected, 
              all data flows directly between devices without passing through any server.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">OAuth Sign-In Data</h2>
            <p className="text-muted-foreground">
              When you sign in with Google or GitHub, we receive:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Google:</strong> Your name, email address, and profile picture</li>
              <li><strong>GitHub:</strong> Your username, email address, and profile picture</li>
            </ul>
            <p className="text-muted-foreground">
              We do not receive or store your Google/GitHub password. Authentication is handled securely by these providers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Password Security</h2>
            <p className="text-muted-foreground">
              If you create an account with email and password, your password is securely hashed using 
              industry-standard bcrypt encryption before storage. We never store or have access to your plain-text password.
            </p>
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
              <li><strong>Cloudinary:</strong> For secure file storage and delivery (Drop uploads only)</li>
              <li><strong>PeerJS:</strong> Signaling server to establish P2P connections (Flash transfers). Only connection metadata is exchanged - not your files.</li>
              <li><strong>STUN servers:</strong> Public servers (Google, Cloudflare, Twilio, Mozilla) to help establish peer connections</li>
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
            <h2 className="text-xl font-semibold">Account Deletion</h2>
            <p className="text-muted-foreground">
              When you delete your account, the following data is permanently removed:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All your uploaded files from our cloud storage (Cloudinary)</li>
              <li>All share links associated with your files</li>
              <li>Your account information (email, name, profile picture)</li>
              <li>Your upload quota and usage history</li>
            </ul>
            <p className="text-muted-foreground">
              This action is irreversible. Local browser history of your shares is cleared separately from your device.
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
