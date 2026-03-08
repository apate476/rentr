// Dashboard Utility Functions
// Formatting, calculations, and data transformations

/**
 * Format a number with commas (e.g., 1234 -> "1,234")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format a percentage (e.g., 0.15 -> "15%")
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
}

/**
 * Format a date to readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export interface Trend {
  direction: 'up' | 'down' | 'neutral'
  percentage: number
  period: string
}

/**
 * Calculate trend direction and percentage
 */
export function calculateTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'neutral',
      percentage: current > 0 ? 100 : 0,
      period: 'vs previous period',
    }
  }

  const change = ((current - previous) / previous) * 100
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'

  return {
    direction,
    percentage: Math.abs(change),
    period: 'vs previous period',
  }
}

export interface Trend {
  direction: 'up' | 'down' | 'neutral'
  percentage: number
  period: string
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Calculate months between two dates
 */
export function calculateMonthsBetween(
  startDate: string | Date,
  endDate: string | Date = new Date()
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  return Math.max(0, months)
}

/**
 * Calculate community impact score (0-100)
 * Based on helpful votes, pioneer properties, and engagement
 */
export function calculateImpactScore(
  helpfulVotes: number,
  pioneerProperties: number,
  reviewsWithVotes: number,
  totalReviews: number
): number {
  // Normalize metrics to 0-100 scale
  const votesScore = Math.min(100, (helpfulVotes / 100) * 50) // Max 50 points from votes
  const pioneerScore = Math.min(30, pioneerProperties * 2.5) // Max 30 points from pioneers
  const engagementScore = totalReviews > 0 ? (reviewsWithVotes / totalReviews) * 20 : 0 // Max 20 points from engagement

  return Math.round(votesScore + pioneerScore + engagementScore)
}

/**
 * Calculate percentile rank
 */
export function calculatePercentile(userValue: number, allValues: number[]): number {
  if (allValues.length === 0) return 0
  const sorted = [...allValues].sort((a, b) => a - b)
  const below = sorted.filter((v) => v < userValue).length
  return Math.round((below / sorted.length) * 100)
}

/**
 * Format score with one decimal place
 */
export function formatScore(score: number | null): string {
  if (score === null) return 'N/A'
  return score.toFixed(1)
}
