import { AddressSearch } from '@/components/address-search'

export default function SearchPage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold">
            Search an address
          </h1>
          <p className="text-muted-foreground">Find reviews for any apartment, condo, or house.</p>
        </div>

        <AddressSearch />
      </div>
    </div>
  )
}
