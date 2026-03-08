'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, FileText, User, Settings, Menu, X, LayoutDashboard, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddressSearch } from '@/components/address-search'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavSidebarProps {
  user: { id: string } | null | undefined
}

export function NavSidebar({ user }: NavSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Generic navigation for signed-out users
  const publicNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/login', label: 'Sign in', icon: LogIn },
  ]

  // Full navigation for signed-in users
  const privateNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/review/new', label: 'Write a Review', icon: FileText },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const navItems = user ? privateNavItems : publicNavItems

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Hamburger menu button - always visible */}
      <Button
        variant="ghost"
        size="icon"
        className="bg-warm-card border-warm-border hover:bg-warm-secondary fixed top-3 left-3 z-[60] border shadow-lg transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Sidebar */}
      <aside
        className={cn(
          'bg-warm-card border-warm-border fixed top-0 left-0 z-[50] h-screen w-80 border-r shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-warm-border border-b px-6 py-5">
            <Link
              href="/"
              className="font-display text-warm-text hover:text-warm-text/80 text-2xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              rentr
            </Link>
          </div>

          {/* Search - only show if signed in */}
          {user && (
            <div className="border-warm-border border-b px-4 py-4">
              <AddressSearch />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                    active
                      ? 'bg-warm-secondary text-warm-text shadow-sm'
                      : 'text-warm-muted hover:bg-warm-secondary hover:text-warm-text'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
