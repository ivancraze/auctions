import type { ComponentPropsWithoutRef } from 'react'

import styles from './Badge.module.scss'

export type BadgeTone = 'active' | 'neutral' | 'danger' | 'success' | 'type'

interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  tone?: BadgeTone
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  const toneClass = styles[tone]

  return (
    <span
      className={`${styles.badge} ${toneClass} ${className ?? ''}`}
      {...props}
    />
  )
}

export function BadgeGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={`${styles.group} ${className ?? ''}`} {...props} />
}
