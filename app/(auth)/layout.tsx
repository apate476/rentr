export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Wordmark */}
        <div className="text-center">
          <span className="text-primary font-[family-name:var(--font-poppins)] text-4xl font-black tracking-tight">
            rentr
          </span>
          <p className="text-muted-foreground mt-1 text-sm">Real reviews from real tenants.</p>
        </div>

        {children}
      </div>
    </div>
  )
}
