import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "QuickDrop - Instant File Sharing | P2P & Cloud Transfer"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage: "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 32 32"
            fill="none"
            style={{ marginRight: 20 }}
          >
            <rect width="32" height="32" rx="6" fill="#18181b" />
            <g
              fill="none"
              stroke="#fafafa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 18v3a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 10 21v-3" />
              <polyline points="19.5 13 16 9.5 12.5 13" />
              <line x1="16" y1="9.5" x2="16" y2="18" />
            </g>
          </svg>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-0.02em",
            }}
          >
            QuickDrop
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              textAlign: "center",
            }}
          >
            Instant File Sharing | P2P & Cloud
          </span>
          <span
            style={{
              fontSize: 24,
              color: "#71717a",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Flash P2P transfers • Expiring links • No signup required
          </span>
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
          }}
        >
          {["Instant Upload", "Expiring Links", "Auto-Delete", "No Signup"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 24px",
                  backgroundColor: "#27272a",
                  borderRadius: 9999,
                  fontSize: 18,
                  color: "#e4e4e7",
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
