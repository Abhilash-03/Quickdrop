# QuickDrop

A modern, fast file sharing application built with Next.js 16. Two powerful ways to share: **Drop** for cloud links with auto-expiring URLs, or **Flash** for instant peer-to-peer transfers.

[![Live Demo](https://img.shields.io/badge/Demo-quickdrop--flash.vercel.app-blue?style=flat-square)](https://quickdrop-flash.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)

## Features

### 🌐 Drop (Cloud Upload)
- **No Signup Required** — Upload and share files anonymously, instantly
- **Auto-Expiring Links** — Links expire after 24 hours or custom duration
- **Download Limits** — Set max downloads (1–100), files auto-delete when limit is reached
- **Password Protection** — Optionally protect shared files with a password
- **File Preview** — Preview images directly on the download page
- **QR Codes** — Generate QR codes for easy mobile sharing
- **10MB File Limit** — Support for images, PDFs, and ZIP files

### ⚡ Flash (P2P Transfer)
- **Direct P2P Transfer** — Files go directly between devices, never touch our servers
- **1GB File Limit** — Transfer large files without cloud upload limits
- **Any File Type** — No restrictions on file formats
- **6-Character Codes** — Simple room codes for easy sharing
- **QR Code Scanning** — Scan sender's QR code to connect instantly
- **Real-time Progress** — Live transfer progress with speed stats
- **Background Transfer Support** — Keeps transfers alive even when screen dims
- **End-to-End Encrypted** — WebRTC DTLS encryption by default
- **Cross-Platform** — Works on iOS Safari, Android Chrome, and desktop browsers
- **No Account Required** — Just select, share code, and transfer

### 📱 Global QR Scanner
- **Scan Any QR** — Header button opens camera to scan any QuickDrop QR code
- **Smart Detection** — Automatically detects Flash codes vs Drop download links
- **Auto-Route** — Scanned codes route to the correct page automatically
- **External Links** — Can scan and open external URLs too

### 📤 Sharing
- **Social Sharing** — Share via WhatsApp, Telegram, X, Facebook, Reddit, LinkedIn, Slack, Email
- **Copy Link** — One-click copy to clipboard
- **Share Code** — For Flash transfers, share a simple 6-character code

### 🎨 User Experience
- **Optional Auth** — Sign in with Google, GitHub, or email/password for dashboard & persistent history
- **Dashboard** — View and manage all your shared files (authenticated users)
- **Local History** — Track uploads with localStorage (anonymous users)
- **Profile & Stats** — View upload statistics and manage account settings
- **Dark/Light Mode** — Automatic theme switching based on system preference
- **Fully Responsive** — Clean, minimal UI on all devices
- **Smooth Animations** — Framer Motion powered transitions and effects

### 🔍 SEO & Social
- **Dynamic OG Images** — Auto-generated Open Graph images for social sharing
- **Twitter Cards** — Rich Twitter card previews
- **PWA Ready** — Web app manifest for installable experience

### 📊 Limits & Quotas

| Feature | Drop (Cloud) | Flash (P2P) |
|---------|--------------|-------------|
| **Max File Size** | 10MB | 1GB |
| **File Types** | Images, PDFs, ZIPs | Any |
| **Daily Limit** | 3 (anon) / 20 (auth) | Unlimited |
| **Expiration** | Up to 30 days | 10 min room code |
| **Storage** | Cloud (Cloudinary) | Direct transfer |

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | MongoDB with Prisma ORM |
| **Storage** | Cloudinary (Drop uploads) |
| **P2P** | PeerJS + WebRTC (Flash transfers) |
| **QR Scanning** | html5-qrcode |
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

## How Flash P2P Works

1. **Sender** selects a file and gets a 6-character room code + QR code
2. **Receiver** enters the code manually or scans the QR code
3. **WebRTC** establishes a direct peer-to-peer connection via 8 STUN servers
4. **File transfers** directly between devices (no server storage)
5. **Background support** keeps transfers alive with Wake Lock API & keep-alive pings
6. **Room expires** after 10 minutes or when transfer completes

> **Note:** Flash uses multiple public STUN servers for NAT traversal, including Google, Cloudflare, Twilio, and Mozilla. Works on iOS Safari, Android Chrome, and desktop browsers. Cross-network transfers may be limited by strict NAT/firewall on some mobile carriers.

## License

MIT

