import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[MoneyFlow] Uncaught error:', error, info)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
            <div className="text-5xl">⚠️</div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Terjadi Kesalahan
              </h1>
              <p className="text-muted-foreground text-sm">
                Aplikasi mengalami error yang tidak terduga. Data kamu tetap aman.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-destructive/10 rounded-xl p-4 text-left">
                <p className="text-destructive text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
