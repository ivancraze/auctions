import type { ComponentPropsWithoutRef } from 'react'

import styles from './Skeleton.module.scss'

type SkeletonVariant = 'title' | 'block'

interface SkeletonProps extends ComponentPropsWithoutRef<'span'> {
  variant?: SkeletonVariant
}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${variant ? styles[variant] : ''} ${className ?? ''}`}
      {...props}
      aria-hidden="true"
    />
  )
}
