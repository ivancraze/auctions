import type { ButtonVariant } from './Button'

import styles from './Button.module.scss'

export function buttonClassName(variant: ButtonVariant, className?: string) {
  return `${styles.button} ${styles[variant]} ${className ?? ''}`
}
