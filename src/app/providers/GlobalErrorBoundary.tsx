import { Component, type ErrorInfo, type ReactNode } from 'react'

interface GlobalErrorBoundaryProps {
  children: ReactNode
}

interface GlobalErrorBoundaryState {
  error: Error | null
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React error', error, errorInfo.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="global-error" role="alert">
        <div className="state-card state-card--error">
          <p className="eyebrow">Непредвиденная ошибка</p>
          <h1>Приложение не смогло продолжить работу</h1>
          <p>Обновите страницу или вернитесь к списку аукционов.</p>
          {import.meta.env.DEV ? (
            <details className="global-error__details">
              <summary>Техническая информация</summary>
              <code>{this.state.error.message}</code>
            </details>
          ) : null}
          <a className="button button--primary" href="/auctions">
            Вернуться к аукционам
          </a>
        </div>
      </main>
    )
  }
}
