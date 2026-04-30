"use client"

import { useState } from "react"
import { QrCode, Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"

interface QRCodeDisplayProps {
  url: string
  filename?: string
  size?: number
  className?: string
}

// Shared QR code display component
export function QRCodeDisplay({
  url,
  filename = "share",
  size = 160,
  className,
}: QRCodeDisplayProps) {
  const qrId = `qr-code-${filename.replace(/[^a-zA-Z0-9]/g, "-")}`

  const handleDownloadQR = () => {
    const svg = document.getElementById(qrId)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngUrl = canvas.toDataURL("image/png")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `quickdrop-qr-${filename}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      toast.success("QR code downloaded!")
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className={`flex flex-col items-center gap-3 p-4 rounded-lg bg-white ${className || ""}`}>
      <QRCodeSVG
        id={qrId}
        value={url}
        size={size}
        level="H"
        includeMargin
        bgColor="#ffffff"
        fgColor="#000000"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadQR}
        className="text-black hover:bg-gray-100"
      >
        <Download className="h-4 w-4 mr-2" />
        Download QR
      </Button>
    </div>
  )
}

interface QRCodePopoverProps {
  url: string
  filename?: string
  variant?: "ghost" | "outline" | "default"
  className?: string
}

export function QRCodePopover({
  url,
  filename = "share",
  variant = "ghost",
  className,
}: QRCodePopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={className}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <QRCodeDisplay url={url} filename={filename} />
      </PopoverContent>
    </Popover>
  )
}
