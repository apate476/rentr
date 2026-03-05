import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-lg space-y-6 text-center">
        <h1 className="text-primary font-[family-name:var(--font-poppins)] text-6xl font-black tracking-tight">
          rentr
        </h1>
        <p className="text-muted-foreground text-xl">
          Real reviews from real tenants. Know before you sign.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
