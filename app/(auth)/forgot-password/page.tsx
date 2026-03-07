import { Suspense } from 'react'
import { ForgotPasswordForm } from './forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-bg px-4">
      <div className="w-full max-w-md">
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
