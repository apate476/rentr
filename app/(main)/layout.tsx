import Link from 'next/link'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/supabase/actions'
import { Button } from '@/components/ui/button'
import { AiChatWidget } from '@/components/ai-chat-widget'
import { NavSidebar } from '@/components/shared/nav-sidebar'
import { LogOut, User as UserIcon } from 'lucide-react'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="bg-warm-bg min-h-screen">
      <NavSidebar user={user ?? null} />

      <header className="border-warm-border from-warm-card via-warm-card to-warm-secondary/30 shadow-warm-border/20 sticky top-0 z-30 border-b bg-gradient-to-r shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <div className="w-12" /> {/* Spacer for hamburger menu button */}
          <nav className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <form action={signOut}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="border-warm-border text-warm-text hover:bg-warm-secondary rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-warm-text text-warm-card hover:bg-warm-text/90 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Link href="/login">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="bg-warm-bg min-h-[calc(100vh-64px)]">{children}</main>
      <AiChatWidget />
      <Toaster position="top-center" richColors />
    </div>
  )
}
