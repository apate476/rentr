import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AddressSearch } from '@/components/address-search'
import { PropertyCard } from '@/components/property-card'
import type { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']

interface SearchPageProps {
  searchParams: Promise<{ q?: string; city?: string; place_id?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, city, place_id } = await searchParams

  // No params — show search form
  if (!q && !city) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold">
              Search an address
            </h1>
            <p className="text-muted-foreground">
              Find reviews for any apartment, condo, or house.
            </p>
          </div>
          <AddressSearch />
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  // Address search
  if (q) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .ilike('address', `%${q}%`)
      .limit(5)
    const properties = data as PropertyRow[] | null

    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <AddressSearch />
        </div>

        {properties && properties.length > 0 ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              {properties.length} result{properties.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
            </p>
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-dashed p-10 text-center">
            <p className="font-medium">&ldquo;{q}&rdquo;</p>
            <p className="text-muted-foreground text-sm">
              No reviews yet for this address. Be the first to share your experience.
            </p>
            <Link
              href={`/property/new?q=${encodeURIComponent(q)}${place_id ? `&place_id=${place_id}` : ''}`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Write the first review →
            </Link>
          </div>
        )}
      </div>
    )
  }

  // City search
  const { data } = await supabase
    .from('properties')
    .select('*')
    .ilike('city', `%${city}%`)
    .order('avg_overall', { ascending: false })
    .limit(20)
  const properties = data as PropertyRow[] | null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <AddressSearch />
      </div>

      {properties && properties.length > 0 ? (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} in {city}
          </p>
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl border border-dashed p-10 text-center">
          <p className="font-medium">No reviewed properties in {city} yet.</p>
          <p className="text-muted-foreground text-sm">
            Search a specific address to leave the first review.
          </p>
        </div>
      )}
    </div>
  )
}
