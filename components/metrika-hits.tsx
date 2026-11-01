'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const METRIKA_ID = 113360886

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void
  }
}

// Next.js changes pages without a reload, and Metrika only counts the first load on its own,
// so every client-side navigation is reported as a hit by hand.
export function MetrikaHits() {
  const pathname = usePathname()
  const previousUrl = useRef<string | null>(null)

  useEffect(() => {
    const url = location.href
    const referer = previousUrl.current
    previousUrl.current = url
    if (!referer || referer === url || pathname.startsWith('/admin')) return
    window.ym?.(METRIKA_ID, 'hit', url, { title: document.title, referer })
  }, [pathname])

  return null
}
