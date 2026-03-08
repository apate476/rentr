'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'

type Suggestion = { text: string; placeId: string; isCity: boolean }

export function AddressSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setOpen((data.suggestions ?? []).length > 0)
        setActiveIndex(-1)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function selectSuggestion(s: Suggestion) {
    setQuery(s.text)
    setOpen(false)
    const param = s.isCity ? 'city' : 'q'
    router.push(`/search?${param}=${encodeURIComponent(s.text)}&place_id=${s.placeId}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="123 Main St or city name…"
            className="rounded-full px-5 py-6 text-base shadow-sm"
            autoFocus
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
          />
          {loading && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>
        <Button type="submit" size="lg" className="rounded-full px-5">
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="bg-warm-card border-warm-border absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.placeId}>
              <button
                type="button"
                className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm transition-colors ${
                  i === activeIndex ? 'bg-warm-secondary text-warm-text' : 'hover:bg-warm-secondary/50 text-warm-text'
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectSuggestion(s)}
              >
                <span className="truncate">{s.text}</span>
                {s.isCity && (
                  <span className="text-warm-muted ml-3 shrink-0 rounded-lg border border-warm-border bg-warm-secondary px-2 py-0.5 text-xs">
                    City
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
