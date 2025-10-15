"use client"

import { useMemo } from "react"

import { Button } from "@/components/ui/button"

export type CelebrationOverlayProps = {
  open: boolean
  title: string
  message: string
  subtext?: string
  onClose: () => void
}

const CONFETTI_COLORS = ["#f8f1e6", "#f7d8a6", "#f9a8d4", "#93c5fd", "#bbf7d0"]

export function CelebrationOverlay({ open, title, message, subtext, onClose }: CelebrationOverlayProps) {
  const confettiPieces = useMemo(() => Array.from({ length: 28 }, (_, index) => index), [])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiPieces.map((piece) => {
          const color = CONFETTI_COLORS[piece % CONFETTI_COLORS.length]
          const delay = Math.random() * 0.5
          const duration = 1.6 + Math.random() * 0.8
          const horizontal = Math.random() * 100

          return (
            <span
              key={piece}
              className="confetti-piece"
              style={{
                left: `${horizontal}%`,
                backgroundColor: color,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          )
        })}
      </div>
      <div className="relative z-[71] max-w-md rounded-3xl border border-white/20 bg-[#2a0b11]/90 p-8 text-center text-[#f8f1e6] shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f1e6]/10">
          <span className="text-3xl" aria-hidden>
            ✨
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#fdfaf5]">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-[#f1dfd5]">{message}</p>
        {subtext ? <p className="mt-2 text-sm text-[#f1dfd5]/80">{subtext}</p> : null}
        <div className="mt-6 flex justify-center">
          <Button onClick={onClose} className="bg-[#f8f1e6] text-[#2a0b11] hover:bg-[#f1dfd5]">
            Continue reciting
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CelebrationOverlay
