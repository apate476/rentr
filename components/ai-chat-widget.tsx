'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AI_FREE_CHATS_PER_MONTH } from '@/lib/constants'

type Message = { role: 'user' | 'assistant'; content: string }

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [exhausted, setExhausted] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  // Extract property ID from pathname like /property/[id]
  const propertyMatch = pathname.match(/^\/property\/([^/]+)$/)
  const propertyId = propertyMatch?.[1] ?? null
  const isPropertyPage = !!propertyId

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function sendMessage() {
    if (!input.trim() || streaming) return

    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setStreaming(true)
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          conversationHistory: messages,
          property_id: propertyId,
        }),
      })

      if (res.status === 401) {
        setNeedsAuth(true)
        setStreaming(false)
        setMessages((prev) => prev.slice(0, -2))
        return
      }

      if (res.status === 429) {
        setExhausted(true)
        setRemaining(0)
        setStreaming(false)
        setMessages((prev) => prev.slice(0, -2))
        return
      }

      const rem = res.headers.get('X-Remaining-Chats')
      if (rem !== null) setRemaining(Number(rem))

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => prev.slice(0, -2))
    } finally {
      setStreaming(false)
    }
  }

  const contextLabel = isPropertyPage ? 'About this property' : 'Renter advisor'
  const placeholder = isPropertyPage
    ? 'Ask about noise, management, pests…'
    : 'Ask me anything about renting…'
  const emptyHint = isPropertyPage
    ? 'Ask anything about this property — noise, management, pests, parking…'
    : 'Ask me anything about renting — what to look for, how scores work, neighborhood advice…'

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[500px] w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Rentr AI</p>
              <p className="text-xs text-slate-400">{contextLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              {remaining !== null && !exhausted && !needsAuth && (
                <span className="text-xs text-slate-400">
                  {remaining}/{AI_FREE_CHATS_PER_MONTH} free
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 transition-colors hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="pt-6 text-center text-sm text-slate-400">{emptyHint}</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {msg.content ||
                    (streaming && i === messages.length - 1 ? (
                      <span className="animate-pulse text-slate-400">●●●</span>
                    ) : (
                      ''
                    ))}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-3">
            {needsAuth ? (
              <p className="text-center text-sm text-slate-500">
                <a href="/login" className="text-primary underline">
                  Sign in
                </a>{' '}
                to use Rentr AI
              </p>
            ) : exhausted ? (
              <p className="text-center text-xs text-slate-500">
                You&apos;ve used your {AI_FREE_CHATS_PER_MONTH} free chats this month.{' '}
                <a href="/settings" className="text-primary underline">
                  Upgrade
                </a>{' '}
                for unlimited access.
              </p>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={placeholder}
                  disabled={streaming}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={streaming || !input.trim()}
                  className="rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
