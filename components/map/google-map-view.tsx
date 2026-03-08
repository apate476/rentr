'use client'

import { useEffect, useRef, useState } from 'react'

interface GoogleMapViewProps {
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
  onPropertyClick?: (propertyId: string) => void
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any
    initGoogleMap: () => void
  }
}

export function GoogleMapView({ onBoundsChange, onPropertyClick }: GoogleMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([])
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    console.log('Google Maps API Key check:', {
      hasKey: !!googleMapsApiKey,
      keyLength: googleMapsApiKey?.length,
      keyPrefix: googleMapsApiKey?.substring(0, 10) + '...',
    })

    if (!googleMapsApiKey) {
      console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set')
      console.error(
        'Available env vars:',
        Object.keys(process.env).filter((k) => k.includes('GOOGLE'))
      )
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
            <div>
              <p style="color: #64748b; margin-bottom: 8px;">Map unavailable</p>
              <p style="color: #94a3b8; font-size: 14px;">Google Maps API key not configured</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Please check your .env.local file and restart the dev server</p>
            </div>
          </div>
        `
      }
      return
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.MapTypeId) {
      console.log('Google Maps already loaded')
      // Use setTimeout to avoid setState in effect
      setTimeout(() => setScriptLoaded(true), 0)
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
    if (existingScript) {
      console.log('Google Maps script already in DOM, waiting for load...')
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.MapTypeId) {
          console.log('Google Maps loaded from existing script')
          setScriptLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)

      // Also listen to the script's load event if it's still loading
      if (existingScript instanceof HTMLScriptElement && !existingScript.onload) {
        existingScript.onload = () => {
          console.log('Existing script loaded')
          if (window.google && window.google.maps && window.google.maps.MapTypeId) {
            setScriptLoaded(true)
          }
          clearInterval(checkInterval)
        }
      }

      return () => clearInterval(checkInterval)
    }

    // Load the script using Google's recommended async loading pattern
    console.log('Loading Google Maps script...')
    const script = document.createElement('script')
    // Add loading=async parameter as recommended by Google Maps API
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('Google Maps script loaded successfully')
      // Wait a bit for MapTypeId to be available
      const checkMapTypeId = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.MapTypeId) {
          console.log('MapTypeId is now available')
          setScriptLoaded(true)
          clearInterval(checkMapTypeId)
        }
      }, 50)

      // Timeout after 2 seconds
      setTimeout(() => {
        clearInterval(checkMapTypeId)
        if (window.google && window.google.maps) {
          setScriptLoaded(true)
        }
      }, 2000)
    }
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error)
      console.error('Script URL:', script.src.substring(0, 50) + '...')
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
            <div>
              <p style="color: #64748b; margin-bottom: 8px;">Map unavailable</p>
              <p style="color: #94a3b8; font-size: 14px;">Failed to load Google Maps</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Check browser console for details. Ensure Maps JavaScript API is enabled.</p>
            </div>
          </div>
        `
      }
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup: don't remove script as other components might be using it
    }
  }, [])

  // Initialize map once script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapContainer.current || map.current) {
      console.log('Map init check:', {
        scriptLoaded,
        hasContainer: !!mapContainer.current,
        hasMap: !!map.current,
        hasGoogle: !!(window.google && window.google.maps),
        hasMapTypeId: !!window.google?.maps?.MapTypeId,
      })
      return
    }

    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not available')
      return
    }

    // Ensure MapTypeId is available before initializing
    if (!window.google.maps.MapTypeId) {
      console.log('MapTypeId not available yet, waiting...')
      const timeoutId = setTimeout(() => {
        if (window.google?.maps?.MapTypeId && mapContainer.current && !map.current) {
          initializeMap()
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }

    initializeMap()

    function initializeMap() {
      if (!mapContainer.current || map.current) return

      if (!window.google?.maps?.MapTypeId) {
        console.error('MapTypeId still not available')
        return
      }

      console.log('Initializing Google Map...')
      try {
        map.current = new window.google.maps.Map(mapContainer.current, {
          center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
          zoom: 12,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })
        console.log('Google Map initialized successfully')

        map.current.addListener('tilesloaded', () => {})

        // Fetch and display pins
        fetch('/api/map/pins')
          .then((res) => res.json())
          .then(
            ({
              data,
            }: {
              data: Array<{ id: string; lat: number; lng: number; avg_overall: number | null }>
            }) => {
              if (!map.current || !data) return

              // Clear existing markers
              markersRef.current.forEach((marker) => marker.setMap(null))
              markersRef.current = []

              // Add markers for each property
              data.forEach((property) => {
                const color =
                  property.avg_overall !== null
                    ? property.avg_overall >= 4
                      ? '#22c55e'
                      : property.avg_overall >= 3
                        ? '#eab308'
                        : '#ef4444'
                    : '#94a3b8'

                const marker = new window.google.maps.Marker({
                  position: { lat: property.lat, lng: property.lng },
                  map: map.current!,
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  },
                  title: `Property ${property.id}`,
                })

                marker.addListener('click', () => {
                  onPropertyClick?.(property.id)
                })

                markersRef.current.push(marker)
              })
            }
          )
          .catch((err) => {
            console.error('Failed to load map pins:', err)
          })

        // Handle bounds changes
        const updateBounds = () => {
          if (!map.current) return

          const bounds = map.current.getBounds()
          if (!bounds) return

          const ne = bounds.getNorthEast()
          const sw = bounds.getSouthWest()

          onBoundsChange?.({
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng(),
          })
        }

        map.current.addListener('bounds_changed', updateBounds)
        map.current.addListener('idle', updateBounds)

        // Initial bounds
        updateBounds()
      } catch (error) {
        console.error('Error initializing Google Map:', error)
        return
      }
    }

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null))
      if (map.current) {
        window.google.maps.event.clearInstanceListeners(map.current)
      }
    }
  }, [scriptLoaded, onBoundsChange, onPropertyClick])

  return (
    <div
      ref={mapContainer}
      className="h-full w-full"
      style={{ minHeight: '400px', height: '100%', width: '100%' }}
    />
  )
}
