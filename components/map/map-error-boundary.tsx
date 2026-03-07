'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Map error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-warm-bg p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-600" />
            <h2 className="font-display text-xl font-semibold text-warm-text mb-2">
              Map unavailable
            </h2>
            <p className="text-sm text-warm-muted mb-6">
              We&apos;re having trouble loading the map. This might be due to a network issue or
              missing configuration.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="bg-warm-text text-warm-card hover:bg-warm-text/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
