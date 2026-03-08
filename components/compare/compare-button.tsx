'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COMPARE_STORAGE_KEY = 'rentr_compare_properties'

interface CompareButtonProps {
  propertyId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

function mapSize(size: 'sm' | 'md' | 'lg'): 'sm' | 'default' | 'lg' {
  return size === 'md' ? 'default' : size
}

export function CompareButton({ propertyId, variant = 'outline', size = 'sm' }: CompareButtonProps) {
  const router = useRouter()
  const [isInCompare, setIsInCompare] = useState(false)
  const [compareCount, setCompareCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY)
    if (stored) {
      const ids = JSON.parse(stored) as string[]
      setIsInCompare(ids.includes(propertyId))
      setCompareCount(ids.length)
    }
  }, [propertyId])

  const handleToggle = () => {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY)
    const currentIds = stored ? (JSON.parse(stored) as string[]) : []

    if (isInCompare) {
      // Remove from compare
      const newIds = currentIds.filter((id) => id !== propertyId)
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(newIds))
      setIsInCompare(false)
      setCompareCount(newIds.length)
    } else {
      // Add to compare (max 3)
      if (currentIds.length >= 3) {
        alert('You can compare up to 3 properties. Remove one first.')
        return
      }
      const newIds = [...currentIds, propertyId]
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(newIds))
      setIsInCompare(true)
      setCompareCount(newIds.length)
    }
  }

  const handleGoToCompare = () => {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY)
    if (stored) {
      const ids = JSON.parse(stored) as string[]
      router.push(`/compare?ids=${ids.join(',')}`)
    }
  }

  if (isInCompare) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleToggle}
          variant="default"
          size={mapSize(size)}
          className="rounded-lg bg-warm-text text-warm-card hover:bg-warm-text/90"
        >
          <GitCompare className="h-4 w-4 mr-1.5" />
          Remove from Compare
        </Button>
        {compareCount > 0 && (
          <Button
            onClick={handleGoToCompare}
            variant="outline"
            size={mapSize(size)}
            className="rounded-lg border-warm-border"
          >
            Compare ({compareCount})
          </Button>
        )}
      </div>
    )
  }

  return (
    <Button
      onClick={handleToggle}
      variant={variant}
      size={mapSize(size)}
      className="rounded-lg border-warm-border"
      disabled={compareCount >= 3}
    >
      <GitCompare className="h-4 w-4 mr-1.5" />
      Add to Compare
    </Button>
  )
}
