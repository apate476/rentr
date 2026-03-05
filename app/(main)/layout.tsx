import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/supabase/actions'
import { Button } from '@/components/ui/button'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/search"
            className="text-primary font-[family-name:var(--font-poppins)] text-2xl font-black tracking-tight"
          >
            rentr
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/profile">Profile</Link>
                </Button>
                <form action={signOut}>
                  <Button type="submit" variant="outline" size="sm" className="rounded-full">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
