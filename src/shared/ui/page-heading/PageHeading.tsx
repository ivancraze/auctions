import type { ComponentPropsWithoutRef } from 'react'

import styles from './PageHeading.module.scss'

export function PageHeading({
  className,
  ...props
}: ComponentPropsWithoutRef<'header'>) {
  return (
    <header className={`${styles.heading} ${className ?? ''}`} {...props} />
  )
}

export function Eyebrow({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return <p className={`${styles.eyebrow} ${className ?? ''}`} {...props} />
}

export function PageSubtitle({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return <p className={`${styles.subtitle} ${className ?? ''}`} {...props} />
}
