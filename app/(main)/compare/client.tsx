'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ComparisonTable } from '@/components/compare/comparison-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const COMPARE_STORAGE_KEY = 'rentr_compare_properties'

interface CompareClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProperties: any[]
}

export function CompareClient({ initialProperties }: CompareClientProps) {
  const router = useRouter()
  const [properties, setProperties] = useState(initialProperties)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch AI summaries for properties
    const fetchSummaries = async () => {
      setIsLoading(true)
      try {
        const summaries = await Promise.all(
          properties.map(async (property) => {
            try {
              const response = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ property_id: property.id }),
              })
              if (response.ok) {
                const summary = await response.json()
                return {
                  ...property,
                  top_pros: summary.praised || [],
                  top_complaints: summary.issues || [],
                }
              }
              return property
            } catch {
              return property
            }
          })
        )
        setProperties(summaries)
      } catch (error) {
        console.error('Error fetching summaries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (properties.length > 0) {
      fetchSummaries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemove = (propertyId: string) => {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY)
    if (stored) {
      const ids = JSON.parse(stored) as string[]
      const newIds = ids.filter((id) => id !== propertyId)
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(newIds))

      if (newIds.length === 0) {
        router.push('/compare')
      } else {
        router.push(`/compare?ids=${newIds.join(',')}`)
      }
    }
  }

  const handleAddProperty = () => {
    router.push('/search')
  }

  return (
    <div className="space-y-6">
      {properties.length < 3 && (
        <Button
          onClick={handleAddProperty}
          variant="outline"
          className="border-warm-border w-full rounded-lg sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property to Compare
        </Button>
      )}

      {isLoading ? (
        <div className="border-warm-border bg-warm-card rounded-xl border p-12 text-center">
          <p className="text-warm-muted">Loading comparison data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ComparisonTable properties={properties} onRemove={handleRemove} />
        </div>
      )}
    </div>
  )
}
