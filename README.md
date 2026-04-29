# QuickDrop

A modern, fast file sharing application built with Next.js 15. Share files instantly with secure, auto-expiring links.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
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
- **Social Sharing** — Share via WhatsApp, Telegram, X, Facebook, Reddit, LinkedIn, Email
- **Copy Link** — One-click copy to clipboard

### User Experience
- **Optional Auth** — Sign in with Google, GitHub, or email/password for dashboard & persistent history
- **Dashboard** — View and manage all your shared files (authenticated users)
- **Local History** — Track uploads with localStorage (anonymous users)
- **Profile & Stats** — View upload statistics and manage account settings
- **Dark/Light Mode** — Automatic theme switching based on system preference
- **Fully Responsive** — Clean, minimal UI on all devices

### Limits & Quotas
- **10MB File Limit** — Support for images, PDFs, ZIPs, and more
- **Daily Quotas** — Rate limiting for anonymous and authenticated users
- **Auto-Cleanup** — Files are automatically removed after expiry

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | MongoDB with Prisma ORM |
| **Storage** | Cloudinary |
| **Auth** | NextAuth.js (Google, GitHub, Credentials) |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Animations** | Framer Motion |
| **State** | Zustand (with localStorage persistence) |
| **Data Fetching** | TanStack React Query |
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
├── dashboard/            # User's shared files (auth required)
├── history/              # Local share history
├── profile/              # User profile & settings
├── d/[code]/             # Download page
├── download/[code]/      # Direct file download endpoint
├── auth/                 # Auth-related pages
│   └── popup-callback/   # OAuth popup callback
├── api/
│   ├── auth/             # NextAuth + custom auth endpoints
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
├── auth.ts               # NextAuth configuration
├── upload-store.ts       # Zustand store
├── api.ts                # API utilities
prisma/
└── schema.prisma         # Database schema
```

