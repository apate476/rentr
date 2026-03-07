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
        className="fixed top-3 left-3 z-[60] bg-warm-card shadow-lg border border-warm-border hover:bg-warm-secondary transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-80 bg-warm-card border-r border-warm-border shadow-xl z-[50] transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-warm-border">
            <Link
              href="/"
              className="font-display text-2xl text-warm-text hover:text-warm-text/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              rentr
            </Link>
          </div>

          {/* Search - only show if signed in */}
          {user && (
            <div className="px-4 py-4 border-b border-warm-border">
              <AddressSearch />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
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
