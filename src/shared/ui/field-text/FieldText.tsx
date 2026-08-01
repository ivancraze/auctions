import type { ComponentPropsWithoutRef } from 'react'

import styles from './FieldText.module.scss'

type FieldTextVariant = 'label' | 'note' | 'value' | 'priceValue' | 'userStatus'

interface FieldTextProps extends ComponentPropsWithoutRef<'p'> {
  spaced?: boolean
  variant: FieldTextVariant
}

export function FieldText({
  className,
  spaced = false,
  variant,
  ...props
}: FieldTextProps) {
  return (
    <p
      className={`${styles[variant]} ${spaced ? styles.spaced : ''} ${className ?? ''}`}
      {...props}
    />
  )
}
