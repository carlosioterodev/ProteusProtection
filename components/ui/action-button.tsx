'use client'

import { forwardRef, useRef } from 'react'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_1px_var(--primary)] hover:shadow-[0_0_20px_-2px_var(--primary)]',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
  ghost: 'bg-transparent text-foreground hover:bg-muted border border-border',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_0_1px_var(--destructive)] hover:shadow-[0_0_20px_-2px_var(--destructive)]',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, variant = 'primary', size = 'md', onClick, ...props }, ref) => {
    const localRef = useRef<HTMLButtonElement>(null)

    const setRefs = (node: HTMLButtonElement) => {
      localRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = localRef.current
      if (el) {
        animate(el, {
          scale: [1, 0.94, 1],
          duration: 340,
          ease: 'out(3)',
        })
      }
      onClick?.(e)
    }

    return (
      <button
        ref={setRefs}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)

ActionButton.displayName = 'ActionButton'
