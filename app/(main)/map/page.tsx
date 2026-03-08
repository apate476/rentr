'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedMapView } from '@/components/map/unified-map-view'
import { MapSidebar } from '@/components/map/map-sidebar'
import { MapErrorBoundary } from '@/components/map/map-error-boundary'
import { Button } from '@/components/ui/button'
import { X, List } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

export default function MapPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleBoundsChange = useCallback(
    async (bounds: { north: number; south: number; east: number; west: number }) => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          north: bounds.north.toString(),
          south: bounds.south.toString(),
          east: bounds.east.toString(),
          west: bounds.west.toString(),
        })

        const response = await fetch(`/api/map/properties?${params}`)
        const { data } = await response.json()
        setProperties(data || [])
      } catch (error) {
        console.error('Failed to fetch properties:', error)
        setProperties([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const handlePropertyClick = useCallback(
    (propertyId: string) => {
      router.push(`/property/${propertyId}`)
    },
    [router]
  )

  return (
    <div className="relative flex h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)]">
      {/* Mobile sidebar toggle button */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="bg-warm-text text-warm-card hover:bg-warm-text/90 fixed top-20 left-4 z-40 shadow-lg lg:hidden"
        size="sm"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
      </Button>

      {/* Sidebar - 20% width on desktop, overlay on mobile */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-warm-border bg-warm-card fixed inset-y-0 left-0 z-30 w-4/5 overflow-hidden border-r transition-transform duration-300 lg:static lg:w-1/5 lg:translate-x-0`}
      >
        <div className="relative h-full">
          <MapSidebar properties={properties} isLoading={isLoading} />
          {/* Close button for mobile */}
          <Button
            onClick={() => setSidebarOpen(false)}
            className="bg-warm-text text-warm-card hover:bg-warm-text/90 absolute top-4 right-4 lg:hidden"
            size="sm"
            variant="ghost"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Map - 80% width on desktop, full width on mobile */}
      <div className="relative flex-1 lg:w-4/5">
        <MapErrorBoundary>
          <UnifiedMapView
            onBoundsChange={handleBoundsChange}
            onPropertyClick={handlePropertyClick}
          />
        </MapErrorBoundary>
      </div>
    </div>
  )
}
