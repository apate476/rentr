import { NextRequest, NextResponse } from 'next/server'

const CITY_TYPES = ['locality', 'sublocality', 'neighborhood', 'administrative_area_level_1']

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask':
          'suggestions.placePrediction.text,suggestions.placePrediction.placeId,suggestions.placePrediction.types',
      },
      body: JSON.stringify({
        input: q,
        includedPrimaryTypes: ['address', 'locality', 'sublocality', 'neighborhood'],
        languageCode: 'en',
      }),
    })

    if (!res.ok) return NextResponse.json({ suggestions: [] })

    const data = await res.json()
    const raw: Array<{
      placePrediction: { text: { text: string }; placeId: string; types: string[] }
    }> = data.suggestions ?? []

    const suggestions = raw.slice(0, 5).map((s) => ({
      text: s.placePrediction.text.text,
      placeId: s.placePrediction.placeId,
      isCity: s.placePrediction.types.some((t) => CITY_TYPES.includes(t)),
    }))

    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
