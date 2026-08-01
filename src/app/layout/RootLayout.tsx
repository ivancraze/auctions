import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import styles from './RootLayout.module.scss'

const APP_NAME = 'Умная Логистика'

function getRouteTitle(pathname: string) {
  if (pathname === '/auctions') return 'Аукционы'
  if (pathname.endsWith('/bets')) return 'История ставок'
  if (pathname.endsWith('/bet')) return 'Сделать ставку'
  if (/^\/auctions\/[^/]+$/.test(pathname)) return 'Аукцион'

  return 'Страница не найдена'
}

export function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const mainRef = useRef<HTMLElement>(null)
  const previousPathnameRef = useRef(pathname)
  const routeTitle = getRouteTitle(pathname)

  useEffect(() => {
    document.title = `${routeTitle} — ${APP_NAME}`

    if (previousPathnameRef.current === pathname) return

    previousPathnameRef.current = pathname
    mainRef.current?.focus()
  }, [pathname, routeTitle])

  return (
    <div>
      <a className={styles.skipLink} href="#main-content">
        Перейти к основному содержимому
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.logo} search={{ page: 1 }} to="/auctions">
            Умная Логистика
          </Link>
        </div>
      </header>
      <p className={styles.routeAnnouncement} aria-atomic="true" role="status">
        Открыта страница: {routeTitle}
      </p>
      <main
        className={styles.main}
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  )
}
