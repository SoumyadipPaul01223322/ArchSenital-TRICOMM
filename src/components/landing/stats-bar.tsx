"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { AnimatedCounter } from "@/components/animations/animated-counter"

const stats = [
  { value: 9.8, suffix: "M+", label: "Threats Neutralized", decimals: 1 },
  { value: 430, suffix: "+", label: "Enterprise Customers", decimals: 0 },
  { value: 2, prefix: "< ", suffix: "s", label: "Simulation Speed", decimals: 0 },
  { value: 99.99, suffix: "%", label: "Platform Uptime", decimals: 2 },
]

export function StatsBar() {
  return (
    <section className="relative border-y border-[rgba(255,255,255,0.06)] bg-[#0d0d14]/40 backdrop-blur-md">
      {/* Shimmer overlay */}
      <div className="animate-shimmer pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px lg:grid-cols-4">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} direction="up" delay={i * 100}>
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="font-mono text-3xl font-bold tracking-tight text-[#e8e8ed] sm:text-4xl">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals}
                  duration={2000}
                />
              </span>
              <span className="font-mono text-xs tracking-wider text-[#6a6a7a] uppercase">
                {stat.label}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
