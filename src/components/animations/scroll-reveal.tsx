"use client"

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react"

type RevealDirection = "up" | "left" | "right" | "scale"

interface ScrollRevealProps {
  children: ReactNode
  direction?: RevealDirection
  delay?: number
  duration?: number
  threshold?: number
  className?: string
  once?: boolean
}

const animationMap: Record<RevealDirection, string> = {
  up: "revealUp",
  left: "revealLeft",
  right: "revealRight",
  scale: "revealScale",
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 800,
  threshold = 0.15,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const triggerReveal = useCallback(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    // Small delay to ensure the element renders at opacity:0 first,
    // then the observer can properly trigger the animation
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
        if (entry.isIntersecting) {
          triggerReveal()
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: "50px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMounted, threshold, once, triggerReveal])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? undefined : "translateY(40px)",
        animation: isVisible
          ? `${animationMap[direction]} ${duration}ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms both`
          : "none",
        transition: !isVisible ? "none" : undefined,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
