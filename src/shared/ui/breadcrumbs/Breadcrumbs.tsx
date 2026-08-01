import type { ComponentPropsWithoutRef } from 'react'

import styles from './Breadcrumbs.module.scss'

export function Breadcrumbs({
  className,
  ...props
}: ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav
      aria-label="Навигационная цепочка"
      className={`${styles.breadcrumbs} ${className ?? ''}`}
      {...props}
    />
  )
}
