import * as React from 'react'

import { ErrorState } from '@/components/shared/error-state'

type Props = { children: React.ReactNode }
type State = { error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  handleReset = () => {
    this.setState({})
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-background p-6">
          <ErrorState message={this.state.error.message} onRetry={this.handleReset} />
        </div>
      )
    }
    return this.props.children
  }
}
