'use client'

import { Beaker, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DemoModeToggle() {
  return (
    <div className="bg-white rounded-tenkai border border-tenkai-border p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#C49A3C]/10">
          <Beaker className="size-4 text-[#C49A3C]" />
        </div>
        <div>
          <p className="text-sm font-medium text-charcoal">Demo Mode</p>
          <p className="text-xs text-warm-gray">
            Opens a new tab with sample data — show customers how the portal works
          </p>
        </div>
      </div>
      <a
        href="/api/admin/demo-mode?launch=true"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          type="button"
          className="bg-[#C49A3C] text-white hover:bg-[#B08A2C] rounded-tenkai gap-1.5 shrink-0"
        >
          <ExternalLink className="size-4" />
          Launch Demo
        </Button>
      </a>
    </div>
  )
}
