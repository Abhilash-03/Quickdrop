# QuickDrop

A modern, fast file sharing application built with Next.js 16. Share files instantly with secure, auto-expiring links.

[![Live Demo](https://img.shields.io/badge/Demo-quickdrop--flash.vercel.app-blue?style=flat-square)](https://quickdrop-flash.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)

## Features

### Core
- **No Signup Required** — Upload and share files anonymously, instantly
- **Auto-Expiring Links** — Links expire after 24 hours or custom duration
- **Download Limits** — Set max downloads (1–100), files auto-delete when limit is reached
- **Password Protection** — Optionally protect shared files with a password
- **File Preview** — Preview images directly on the download page
- **QR Codes** — Generate QR codes for easy mobile sharing

### Sharing
- **Social Sharing** — Share via WhatsApp, Telegram, X, Facebook, Reddit, LinkedIn, Slack, Email
- **Copy Link** — One-click copy to clipboard

### User Experience
- **Optional Auth** — Sign in with Google, GitHub, or email/password for dashboard & persistent history
- **Dashboard** — View and manage all your shared files (authenticated users)
- **Local History** — Track uploads with localStorage (anonymous users)
- **Profile & Stats** — View upload statistics and manage account settings
- **Dark/Light Mode** — Automatic theme switching based on system preference
- **Fully Responsive** — Clean, minimal UI on all devices
- **Blur Backdrop** — Beautiful blurred background on all modals

### SEO & Social
- **Dynamic OG Images** — Auto-generated Open Graph images for social sharing
- **Twitter Cards** — Rich Twitter card previews
- **PWA Ready** — Web app manifest for installable experience

### Limits & Quotas
- **10MB File Limit** — Support for images, PDFs, ZIPs, and more
- **Daily Quotas** — Rate limiting for anonymous and authenticated users
- **Auto-Cleanup** — Files are automatically removed after expiry

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | MongoDB with Prisma ORM |
| **Storage** | Cloudinary |
| **Auth** | Auth.js v5 (Google, GitHub, Credentials) |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Animations** | Framer Motion |
| **State** | Zustand (with localStorage persistence) |
| **Data Fetching** | TanStack React Query + Axios |
| **Validation** | Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- Cloudinary account

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URI="mongodb+srv://..."

# Auth.js
AUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_UPLOAD_FOLDER="file-share/uploads"

# App URL (for SEO)
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── page.tsx              # Home page with file uploader
├── opengraph-image.tsx   # Dynamic OG image generation
├── twitter-image.tsx     # Dynamic Twitter card image
├── icon.tsx              # Dynamic favicon
├── apple-icon.tsx        # Apple touch icon
├── dashboard/            # User's shared files (auth required)
├── history/              # Local share history
├── profile/              # User profile & settings
├── d/[code]/             # Download page
├── download/[code]/      # Direct file download endpoint
├── auth/                 # Auth-related pages
│   └── popup-callback/   # OAuth popup callback
├── api/
│   ├── auth/             # Auth.js + custom auth endpoints
│   ├── upload/sign/      # Cloudinary signature endpoint
│   ├── share/            # Create & manage share links
│   ├── links/            # Link status management
│   ├── quota/            # User quota endpoint
│   └── dashboard/        # Dashboard data endpoint
components/
├── file-uploader.tsx     # Main upload component
├── share-link-dialog.tsx # Share modal with QR & social
├── social-share.tsx      # Social sharing buttons
├── header.tsx            # Navigation header
├── footer.tsx            # Page footer
├── ui/                   # shadcn/ui components
hooks/
├── use-file-upload.ts    # Upload logic
├── use-download.ts       # Download logic
├── use-dashboard.ts      # Dashboard data
├── use-link-info.ts      # Link info fetching
├── use-quota.ts          # Quota management
lib/
├── prisma.ts             # Prisma client instance
├── auth.ts               # Auth.js configuration
├── upload-store.ts       # Zustand store
├── api.ts                # API utilities
prisma/
└── schema.prisma         # Database schema
public/
├── favicon.svg           # SVG favicon
└── site.webmanifest      # PWA manifest
```

## License

MIT

