export const REVIEW_BODY_MIN = 50
export const REVIEW_BODY_MAX = 2000
export const REVIEW_PHOTOS_MAX = 5
export const REVIEW_PHOTO_SIZE_MB = 5
export const REVIEW_PHOTO_SIZE_BYTES = REVIEW_PHOTO_SIZE_MB * 1024 * 1024
export const REVIEW_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const SCORE_MIN = 1
export const SCORE_MAX = 5

export const STORAGE_BUCKET = 'review-photos'

export const FREE_REVIEWS_PER_PROPERTY = 5 // reads per day for free users (V2)

export const AI_FREE_CHATS_PER_MONTH = 3

export const PROTECTED_ROUTES = [
  '/property/new',
  '/profile',
  '/settings',
  // /property/[id]/review is handled by dynamic route check in middleware
] as const
