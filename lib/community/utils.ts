/**
 * Normalize city and state into a URL-friendly slug
 * Example: "Chicago, IL" -> "chicago-il"
 */
export function createCitySlug(city: string, state: string): string {
  const normalizedCity = city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const normalizedState = state.toLowerCase().trim().replace(/[^a-z0-9]+/g, '')
  return `${normalizedCity}-${normalizedState}`
}

/**
 * Parse city slug back into city and state
 * Example: "chicago-il" -> { city: "Chicago", state: "IL" }
 */
export function parseCitySlug(slug: string): { city: string; state: string } | null {
  const parts = slug.split('-')
  if (parts.length < 2) return null

  // Last part is state (usually 2 chars), rest is city
  const state = parts[parts.length - 1].toUpperCase()
  const cityParts = parts.slice(0, -1)
  const city = cityParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return { city, state }
}

/**
 * Get category label from value
 */
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    roommates: 'Roommates',
    recommendations: 'Recommendations',
    'landlord-warnings': 'Landlord Warnings',
    'housing-advice': 'Housing Advice',
    general: 'General Discussion',
  }
  return categoryMap[category] || category
}

/**
 * Get category color class for badges
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    roommates: 'bg-blue-50 text-blue-700 border-blue-200',
    recommendations: 'bg-green-50 text-green-700 border-green-200',
    'landlord-warnings': 'bg-red-50 text-red-700 border-red-200',
    'housing-advice': 'bg-purple-50 text-purple-700 border-purple-200',
    general: 'bg-slate-50 text-slate-700 border-slate-200',
  }
  return colorMap[category] || 'bg-slate-50 text-slate-700 border-slate-200'
}
