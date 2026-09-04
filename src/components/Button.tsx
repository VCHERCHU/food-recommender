import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const squash = { scaleX: 1.04, scaleY: 0.92 }
const spring = { type: 'spring', stiffness: 500, damping: 22 } as const

export function Button({
  variant = 'primary',
  size,
  children,
  className = '',
  ...rest
}: { variant?: Variant; size?: 'sm'; children: ReactNode } & HTMLMotionProps<'button'>) {
  return (
    <motion.button
      type="button"
      className={`btn btn--${variant} ${size ? `btn--${size}` : ''} ${className}`}
      whileTap={squash}
      whileHover={{ y: -2 }}
      transition={spring}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

export function LinkButton({
  variant = 'secondary',
  children,
  className = '',
  ...rest
}: { variant?: Variant; children: ReactNode } & HTMLMotionProps<'a'>) {
  return (
    <motion.a
      className={`btn btn--${variant} ${className}`}
      whileTap={squash}
      whileHover={{ y: -2 }}
      transition={spring}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </motion.a>
  )
}
