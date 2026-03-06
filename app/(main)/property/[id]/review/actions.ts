'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database.types'

type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
type PropertyInsert = Database['public']['Tables']['properties']['Insert']

export type ReviewState = { error: string | null }

function getScore(formData: FormData, name: string): number | null {
  const val = Number(formData.get(name))
  return val >= 1 && val <= 5 ? val : null
}

export async function createReview(
  propertyId: string,
  prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in to submit a review.' }

  const scores = {
    score_overall: getScore(formData, 'score_overall'),
    score_value: getScore(formData, 'score_value'),
    score_landlord: getScore(formData, 'score_landlord'),
    score_noise: getScore(formData, 'score_noise'),
    score_pests: getScore(formData, 'score_pests'),
    score_safety: getScore(formData, 'score_safety'),
    score_parking: getScore(formData, 'score_parking'),
    score_pets: getScore(formData, 'score_pets'),
    score_neighborhood: getScore(formData, 'score_neighborhood'),
  }

  const missing = Object.entries(scores)
    .filter(([, v]) => v === null)
    .map(([k]) => k)
  if (missing.length > 0) return { error: 'Please rate all categories before submitting.' }

  const body = (formData.get('body') as string)?.trim()
  if (!body || body.length < 50) return { error: 'Review must be at least 50 characters.' }
  if (body.length > 2000) return { error: 'Review must be under 2000 characters.' }

  const rentRaw = formData.get('rent_amount')
  const rent_amount = rentRaw ? Number(rentRaw) || null : null
  const move_in_year = formData.get('move_in_year') ? Number(formData.get('move_in_year')) : null
  const move_out_year = formData.get('move_out_year') ? Number(formData.get('move_out_year')) : null
  const lease_type = (formData.get('lease_type') as string) || null
  const wouldRentRaw = formData.get('would_rent_again')
  const would_rent_again = wouldRentRaw === 'yes' ? true : wouldRentRaw === 'no' ? false : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any).insert({
    property_id: propertyId,
    user_id: user.id,
    ...(scores as Record<string, number>),
    body,
    rent_amount,
    move_in_year,
    move_out_year,
    lease_type,
    would_rent_again,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this property.' }
    return { error: 'Something went wrong. Please try again.' }
  }

  redirect(`/property/${propertyId}?reviewed=1`)
}

export async function createPropertyAndReview(
  prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in to submit a review.' }

  const address = (formData.get('address') as string)?.trim()
  const city = (formData.get('city') as string)?.trim()
  const state = (formData.get('state') as string)?.trim()
  const zip = (formData.get('zip') as string)?.trim() || null
  const lat = Number(formData.get('lat'))
  const lng = Number(formData.get('lng'))
  const property_type = (formData.get('property_type') as string) || null

  if (!address || !city || !state || !lat || !lng)
    return { error: 'Address information is incomplete.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: _property, error: propError } = await (supabase.from('properties') as any)
    .insert({ address, city, state, zip, lat, lng, property_type, created_by: user.id })
    .select('id')
    .single()

  const property = _property as { id: string } | null

  if (propError || !property) return { error: 'Could not create property listing.' }

  const mockForm = new FormData()
  for (const [key, value] of formData.entries()) mockForm.set(key, value as string)

  return createReview(property.id, prevState, mockForm)
}
