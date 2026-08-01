import type { ComponentPropsWithoutRef } from 'react'

import { buttonClassName } from './buttonClassName'

export type ButtonVariant = 'primary' | 'secondary' | 'disabled'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return <button className={buttonClassName(variant, className)} {...props} />
}
