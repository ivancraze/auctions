import { Link, Outlet } from '@tanstack/react-router'

import styles from './RootLayout.module.scss'

export function RootLayout() {
  return (
    <div>
      <header className={styles.header}>
        <Link className={styles.logo} search={{ page: 1 }} to="/auctions">
          Умная Логистика
        </Link>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
