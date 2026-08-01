import type {
  ComponentPropsWithoutRef,
  ElementType,
  HTMLAttributes,
} from 'react'

import styles from './StateCard.module.scss'

interface StateCardProps extends HTMLAttributes<HTMLElement> {
  as?: Extract<ElementType, 'div' | 'section'>
  tone?: 'default' | 'error'
}

export function StateCard({
  as: Component = 'div',
  className,
  tone = 'default',
  ...props
}: StateCardProps) {
  return (
    <Component
      className={`${styles.card} ${tone === 'error' ? styles.error : ''} ${className ?? ''}`}
      {...props}
    />
  )
}

export function StateCardTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<'h2'>) {
  return <h2 className={`${styles.title} ${className ?? ''}`} {...props} />
}
