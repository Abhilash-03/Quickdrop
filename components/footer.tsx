import Link from "next/link"
import { Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} QuickDrop. Share files securely.
        </p>
        <div className="flex items-center gap-4">
          <Link 
            href="/privacy" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link 
            href="/terms" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
