import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-8 bg-surface-card border border-border-grid text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-signal-error/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-signal-error" />
          </div>
          <h2 className="text-h2 text-ink-primary mb-2">Something went wrong</h2>
          <p className="text-body text-ink-secondary mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.handleReset} variant="secondary" leftIcon={<RefreshCw size={16} />}>
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error display for async errors
interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="p-4 bg-signal-error/10 border border-signal-error">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-signal-error shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-body text-signal-error">{error}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button size="sm" variant="secondary" onClick={onRetry}>
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
