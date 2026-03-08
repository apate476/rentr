'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

interface MapViewProps {
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
  onPropertyClick?: (propertyId: string) => void
}

export function MapView({ onBoundsChange, onPropertyClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  // Store callbacks in refs to prevent re-initialization on callback changes
  const boundsChangeRef = useRef(onBoundsChange)
  const propertyClickRef = useRef(onPropertyClick)

  // Update refs when callbacks change
  useEffect(() => {
    boundsChangeRef.current = onBoundsChange
    propertyClickRef.current = onPropertyClick
  }, [onBoundsChange, onPropertyClick])

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      console.log('Mapbox init check:', {
        hasContainer: !!mapContainer.current,
        hasMap: !!map.current,
      })
      return
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    console.log('Mapbox Token check:', {
      hasToken: !!mapboxToken,
      tokenLength: mapboxToken?.length,
      tokenPrefix: mapboxToken?.substring(0, 10) + '...',
    })
    
    if (!mapboxToken) {
      console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set')
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
            <div>
              <p style="color: #64748b; margin-bottom: 8px;">Map unavailable</p>
              <p style="color: #94a3b8; font-size: 14px;">Mapbox token not configured</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Please check your .env.local file and restart the dev server</p>
            </div>
          </div>
        `
      }
      return
    }

    try {
      mapboxgl.accessToken = mapboxToken
      console.log('Initializing Mapbox map...')

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 12,
      })

      console.log('Mapbox map created successfully')

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully')
        setIsLoaded(true)
      })

      map.current.on('error', (e) => {
        console.error('Mapbox map error:', e)
        if (mapContainer.current) {
          mapContainer.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
              <div>
                <p style="color: #64748b; margin-bottom: 8px;">Map unavailable</p>
                <p style="color: #94a3b8; font-size: 14px;">Failed to load Mapbox map</p>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Check browser console for details</p>
              </div>
            </div>
          `
        }
      })

      // Fetch and display pins
      fetch('/api/map/pins')
        .then((res) => res.json())
        .then(({ data }: { data: Array<{ id: string; lat: number; lng: number; avg_overall: number | null }> }) => {
          if (!map.current || !data) return

          // Clear existing markers
          markersRef.current.forEach((marker) => marker.remove())
          markersRef.current = []

          // Add markers for each property
          data.forEach((property) => {
            const el = document.createElement('div')
            el.className = 'property-marker'
            el.style.width = '24px'
            el.style.height = '24px'
            el.style.borderRadius = '50%'
            el.style.backgroundColor = property.avg_overall
              ? property.avg_overall >= 4
                ? '#22c55e'
                : property.avg_overall >= 3
                  ? '#eab308'
                  : '#ef4444'
              : '#94a3b8'
            el.style.border = '2px solid white'
            el.style.cursor = 'pointer'
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'

            const marker = new mapboxgl.Marker(el)
              .setLngLat([property.lng, property.lat])
              .addTo(map.current!)

            el.addEventListener('click', () => {
              propertyClickRef.current?.(property.id)
            })

            markersRef.current.push(marker)
          })
        })
        .catch((err) => {
          console.error('Failed to load map pins:', err)
        })

      // Handle bounds changes
      const updateBounds = () => {
        if (!map.current) return

        const bounds = map.current.getBounds()
        if (!bounds) return
        
        boundsChangeRef.current?.({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        })
      }

      map.current.on('moveend', updateBounds)
      map.current.on('zoomend', updateBounds)

      // Initial bounds - wait a bit for map to be ready
      setTimeout(() => {
        updateBounds()
      }, 500)

      return () => {
        markersRef.current.forEach((marker) => marker.remove())
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    } catch (error) {
      console.error('Error initializing Mapbox map:', error)
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
            <div>
              <p style="color: #64748b; margin-bottom: 8px;">Map unavailable</p>
              <p style="color: #94a3b8; font-size: 14px;">Error initializing Mapbox: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          </div>
        `
      }
    }
  }, []) // Empty dependency array - only initialize once

  return (
    <div 
      ref={mapContainer} 
      className="h-full w-full" 
      style={{ minHeight: '400px', height: '100%', width: '100%' }}
    />
  )
}
