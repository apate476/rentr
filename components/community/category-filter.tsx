'use client'

import { POST_CATEGORIES, type PostCategory } from '@/types/community.types'
import { getCategoryColor } from '@/lib/community/utils'

interface CategoryFilterProps {
  selectedCategory: PostCategory | null
  onCategoryChange: (category: PostCategory | null) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
          selectedCategory === null
            ? 'border-warm-text bg-warm-text text-warm-card'
            : 'border-warm-border bg-warm-card text-warm-muted hover:border-warm-text/40'
        }`}
      >
        All
      </button>
      {POST_CATEGORIES.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
            selectedCategory === category.value
              ? `${getCategoryColor(category.value)} border-2`
              : 'border-warm-border bg-warm-card text-warm-muted hover:border-warm-text/40'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
