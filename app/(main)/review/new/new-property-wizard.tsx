'use client'

import { useState, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { ReviewWizard } from '@/app/(main)/property/[id]/review/review-wizard'
import { createPropertyAndReview } from '@/app/(main)/property/[id]/review/actions'
import type { ReviewState } from '@/app/(main)/property/[id]/review/actions'

const PROPERTY_TYPES = ['apartment', 'condo', 'house', 'townhouse', 'other']

interface Props {
  address: string
  placeId: string | null
}

export function NewPropertyWizard({ address, placeId: _ }: Props) {
  const [propertyType, setPropertyType] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  // Wrap the server action to inject property fields
  async function wrappedAction(prevState: ReviewState, formData: FormData): Promise<ReviewState> {
    formData.set('address', address)
    formData.set('city', city)
    formData.set('state', state)
    if (zip) formData.set('zip', zip)
    formData.set('property_type', propertyType)
    // Geocoding: lat/lng placeholder — Google Places geocoding would go here
    // For now use 0,0 so the insert doesn't fail (will be fixed when Places geocoding is added)
    formData.set('lat', '0')
    formData.set('lng', '0')
    return createPropertyAndReview(prevState, formData)
  }

  if (!confirmed) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border p-5">
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            Address
          </p>
          <p className="font-semibold">{address}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">City, State, ZIP</p>
          <div className="grid grid-cols-3 gap-2">
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border-input col-span-1 rounded-lg border px-3 py-2 text-sm"
            />
            <input
              placeholder="ST"
              value={state}
              maxLength={2}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              className="border-input rounded-lg border px-3 py-2 text-sm"
            />
            <input
              placeholder="ZIP"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="border-input rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Property type (optional)</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPropertyType(t === propertyType ? '' : t)}
                className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
                  propertyType === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:border-primary/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setConfirmed(true)}
          disabled={!city.trim() || !state.trim()}
          className="w-full rounded-full"
          size="lg"
        >
          Confirm & write review →
        </Button>
      </div>
    )
  }

  return <ReviewWizard propertyId="" action={wrappedAction} />
}
