'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(el, {
              opacity: [0, 1],
              translateY: [24, 0],
              duration: 700,
              delay,
              ease: 'out(3)',
            })
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <Tag
      ref={ref as never}
      className={cn('opacity-0', className)}
    >
      {children}
    </Tag>
  )
}
