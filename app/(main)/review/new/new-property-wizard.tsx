'use client'

import { useState, useActionState } from 'react'
import { ArrowRight } from 'lucide-react'
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
        {/* Address confirmation card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Address</p>
          <p className="font-semibold text-slate-900">{address}</p>
          <p className="mt-0.5 text-xs text-slate-400">Be the first to share your experience.</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">
            City, State, ZIP{' '}
            <span className="text-xs font-normal text-red-400">* required</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="col-span-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              placeholder="ST"
              value={state}
              maxLength={2}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              placeholder="ZIP"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">
            Property type{' '}
            <span className="text-xs font-normal text-slate-400">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPropertyType(t === propertyType ? '' : t)}
                className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-all ${
                  propertyType === t
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
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
          <span className="inline-flex items-center gap-1.5">
            Confirm &amp; write review <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    )
  }

  return <ReviewWizard propertyId="" action={wrappedAction} />
}
