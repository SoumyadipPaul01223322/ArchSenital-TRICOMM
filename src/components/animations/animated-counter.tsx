"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const mountTimer = requestAnimationFrame(() => {
      setHasMounted(true)
    })
    return () => cancelAnimationFrame(mountTimer)
  }, [])

  useEffect(() => {
    if (!hasMounted) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2, rootMargin: "50px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMounted, hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * target)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [hasAnimated, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  )
}
