# QuickDrop

A modern, fast file sharing application built with Next.js. Share files instantly with secure, expiring links — **no signup required**.

## Features

- **No Signup Required** - Upload and share files anonymously, instantly
- **Auto-Expiring Links** - Links expire after 24 hours or custom duration
- **Download Limits** - Set max downloads (1-100), files auto-delete when reached
- **Auto-Delete** - Files are automatically removed after expiry
- **10MB File Limit** - Support for images, PDFs, ZIPs, and more
- **Social Sharing** - Share via WhatsApp, Telegram, X, Facebook, Reddit, LinkedIn, Email
- **Optional Auth** - Sign in with Google/GitHub for dashboard & history
- **Dark/Light Mode** - Automatic theme switching
- **Fully Responsive** - Clean, minimal UI on all devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Prisma ORM
- **Storage**: Cloudinary
- **Auth**: NextAuth.js (Google, GitHub, Credentials)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand (with localStorage persistence)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Cloudinary account

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

GITHUB_ID="..."
GITHUB_SECRET="..."

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx            # Home page with upload
├── dashboard/          # User's shared files
├── history/            # Local share history
├── profile/            # User profile & stats
├── d/[code]/           # Download page
├── api/
│   ├── upload/sign/    # Cloudinary signature
│   ├── share/          # Create share links
│   └── ...
components/
├── header.tsx
├── footer.tsx
├── social-share.tsx
├── ui/                 # shadcn components
lib/
├── prisma.ts
├── upload-store.ts     # Zustand store
prisma/
└── schema.prisma
```

