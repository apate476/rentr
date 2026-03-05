import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <Card className="border-0 text-center shadow-lg">
      <CardHeader className="space-y-1 pb-2">
        <div className="mb-2 text-5xl">✉️</div>
        <CardTitle className="font-[family-name:var(--font-poppins)] text-2xl font-bold">
          Check your email
        </CardTitle>
        <CardDescription className="text-base">
          We sent a confirmation link to your inbox. Click it to activate your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <p className="text-muted-foreground text-sm">
          Didn&apos;t get the email? Check your spam folder or{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            try again
          </Link>
          .
        </p>

        <Button asChild variant="outline" className="rounded-full" size="lg">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
