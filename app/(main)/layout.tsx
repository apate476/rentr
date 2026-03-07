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
    <div className="min-h-screen bg-warm-bg">
      <NavSidebar user={user ?? null} />
      
      <header className="sticky top-0 z-30 border-b border-warm-border bg-gradient-to-r from-warm-card via-warm-card to-warm-secondary/30 backdrop-blur-md shadow-lg shadow-warm-border/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <div className="w-12" /> {/* Spacer for hamburger menu button */}
          
          <nav className="flex items-center gap-3 ml-auto">
            {user ? (
              <>
                <form action={signOut}>
                  <Button 
                    type="submit" 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg border-warm-border text-warm-text hover:bg-warm-secondary hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Button 
                asChild 
                size="sm" 
                className="rounded-lg bg-warm-text text-warm-card hover:bg-warm-text/90 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Link href="/login">
                  <UserIcon className="h-4 w-4 mr-2" />
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
