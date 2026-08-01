import type { ComponentPropsWithoutRef } from 'react'

import styles from './FormField.module.scss'

export function FormField({
  className,
  ...props
}: ComponentPropsWithoutRef<'label'>) {
  return <label className={`${styles.field} ${className ?? ''}`} {...props} />
}

export function FormFieldGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={`${styles.field} ${className ?? ''}`} {...props} />
}
