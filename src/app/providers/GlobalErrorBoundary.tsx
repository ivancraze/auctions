import { Component, type ErrorInfo, type ReactNode } from 'react'

import { buttonClassName, Eyebrow, StateCard } from '@/shared/ui'

import styles from './GlobalErrorBoundary.module.scss'

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
      <main className={styles.root} role="alert">
        <StateCard className={styles.card} tone="error">
          <Eyebrow>Непредвиденная ошибка</Eyebrow>
          <h1>Приложение не смогло продолжить работу</h1>
          <p>Обновите страницу или вернитесь к списку аукционов.</p>
          {import.meta.env.DEV ? (
            <details className={styles.details}>
              <summary>Техническая информация</summary>
              <code>{this.state.error.message}</code>
            </details>
          ) : null}
          <a className={buttonClassName('primary')} href="/auctions">
            Вернуться к аукционам
          </a>
        </StateCard>
      </main>
    )
  }
}
