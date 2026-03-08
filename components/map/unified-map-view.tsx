'use client'

import { useEffect, useState } from 'react'
import { MapView } from './map-view'
import { GoogleMapView } from './google-map-view'
import { createClient } from '@/lib/supabase/client'

interface UnifiedMapViewProps {
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
  onPropertyClick?: (propertyId: string) => void
}

export function UnifiedMapView({ onBoundsChange, onPropertyClick }: UnifiedMapViewProps) {
  const [mapProvider, setMapProvider] = useState<'mapbox' | 'google' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMapPreference() {
      console.log('UnifiedMapView: Fetching map preference...')
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('UnifiedMapView: Error getting user:', userError)
      }

      if (!user) {
        // Default to mapbox if not logged in
        console.log('UnifiedMapView: No user, defaulting to mapbox')
        setMapProvider('mapbox')
        setIsLoading(false)
        return
      }

      console.log('UnifiedMapView: User found, fetching profile...')
      // Fetch user's map preference
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('map_provider')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('UnifiedMapView: Error fetching profile:', profileError)
      }

      const provider = (profile?.map_provider as 'mapbox' | 'google') || 'mapbox'
      console.log('UnifiedMapView: Map provider selected:', provider)
      setMapProvider(provider)
      setIsLoading(false)
    }

    fetchMapPreference()
  }, [])

  if (isLoading || !mapProvider) {
    console.log('UnifiedMapView: Still loading...', { isLoading, mapProvider })
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-warm-muted">Loading map...</div>
      </div>
    )
  }

  console.log('UnifiedMapView: Rendering map with provider:', mapProvider)
  
  if (mapProvider === 'google') {
    return <GoogleMapView onBoundsChange={onBoundsChange} onPropertyClick={onPropertyClick} />
  }

  return <MapView onBoundsChange={onBoundsChange} onPropertyClick={onPropertyClick} />
}
