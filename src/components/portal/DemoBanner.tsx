'use client'

import { Beaker, X } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="bg-[#C49A3C] text-white text-sm font-medium px-4 py-2 flex items-center justify-center gap-2">
      <Beaker className="size-4 shrink-0" />
      <span>DEMO MODE — Viewing sample data for Premier Plumbing Co.</span>
      <a
        href="/api/admin/demo-mode?exit=true"
        className="ml-3 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded px-2 py-0.5 text-xs transition-colors"
      >
        <X className="size-3" />
        Exit Demo
      </a>
    </div>
  )
}
