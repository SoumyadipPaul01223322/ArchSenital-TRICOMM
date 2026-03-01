"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { TiltCard } from "@/components/animations/tilt-card"
import { Map, Target, Wrench } from "lucide-react"

const steps = [
  {
    num: "01",
    icon: Map,
    title: "Map Your Infrastructure",
    desc: "Construct topologies visually on the canvas or ingest your environment via AWS IAM integration. Every service, connection, and dependency - mapped automatically.",
  },
  {
    num: "02",
    icon: Target,
    title: "Simulate Attack Scenarios",
    desc: "Run the AI engine against your topology to identify breach paths, lateral movement risks, and misconfigurations. Real-world threat modeling at scale.",
  },
  {
    num: "03",
    icon: Wrench,
    title: "Review Findings & Auto-Fix",
    desc: "Auto-remediate identified vulnerabilities with Zin AI and output executive-grade PDF reports. From discovery to resolution in a single workflow.",
  },
]

export function WorkflowSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 lg:py-32"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#00e5a0]/[0.02] blur-[100px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up">
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <span className="mb-4 inline-block font-mono text-xs tracking-widest text-[#00e5a0] uppercase">
              The Workflow
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-[#e8e8ed] sm:text-4xl lg:text-5xl">
              Three Steps to Total Visibility
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connector line */}
          <div
            className="absolute top-1/2 right-0 left-0 hidden h-px lg:block"
            aria-hidden="true"
          >
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#00e5a0]/20 to-transparent" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-3">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} direction="up" delay={i * 150}>
                <TiltCard tiltIntensity={6} glareEnabled className="h-full">
                  <div className="hud-card relative h-full p-8">
                    {/* Step number */}
                    <div className="mb-6 flex items-center gap-4">
                      <span className="font-mono text-4xl font-bold text-[#00e5a0]/20">
                        {step.num}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center border border-[#00e5a0]/20 bg-[#00e5a0]/5">
                        <step.icon className="h-5 w-5 text-[#00e5a0]" />
                      </div>
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-[#e8e8ed]">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#8a8a9a]">
                      {step.desc}
                    </p>

                    {/* Glowing dot connector */}
                    {i < steps.length - 1 && (
                      <div
                        className="animate-pulse-dot absolute top-1/2 -right-4 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-[#00e5a0] lg:block"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
