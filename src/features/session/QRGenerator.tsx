'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRGeneratorProps {
  code: string
  size?: number
}

export function QRGenerator({ code, size = 200 }: QRGeneratorProps) {
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/control?code=${code}`
    : `/control?code=${code}`

  return (
    <div className="flex flex-col items-center gap-md">
      <div className="bg-white p-md rounded-xl">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#131b2e"
        />
      </div>
      <div className="text-center">
        <p className="font-label text-label-sm text-on-surface-variant uppercase mb-xs">
          Código de sesión
        </p>
        <p className="font-body text-4xl font-bold text-on-surface tracking-[0.3em]">
          {code}
        </p>
      </div>
    </div>
  )
}
