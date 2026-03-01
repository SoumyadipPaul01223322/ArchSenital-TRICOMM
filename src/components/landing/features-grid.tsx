"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { TiltCard } from "@/components/animations/tilt-card"
import {
  Layers,
  Cpu,
  Sparkles,
  Cloud,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Visual Architecture Canvas",
    desc: "Drag-and-drop components onto an infinite canvas. Map your entire infrastructure topology visually with real-time collaboration.",
    color: "#00e5a0",
  },
  {
    icon: Cpu,
    title: "AI Threat Simulation Engine",
    desc: "Launch real-world attack simulations powered by AI. Identify breach paths across your entire attack surface in seconds.",
    color: "#00b8d4",
  },
  {
    icon: Sparkles,
    title: "One-Click AI Auto-Fix",
    desc: "Zin AI patches misconfigured nodes live. Remediate vulnerabilities instantly with intelligent, context-aware fixes.",
    color: "#ffc107",
  },
  {
    icon: Cloud,
    title: "Live AWS Discovery",
    desc: "Connect IAM for one-click environment topology import. Automatically map your cloud infrastructure in real-time.",
    color: "#00e5ff",
  },
  {
    icon: ClipboardCheck,
    title: "Compliance Auto-Mapping",
    desc: "Track SOC2, ISO 27001, and OWASP compliance. Auto-map controls to your architecture for continuous audit readiness.",
    color: "#00e5a0",
  },
  {
    icon: MessageSquare,
    title: "AI Architecture Generation",
    desc: "Natural language prompting to generate complete blueprinted architectures. Describe what you need, get production-ready designs.",
    color: "#00b8d4",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 right-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#00e5a0]/[0.02] blur-[100px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-block font-mono text-xs tracking-widest text-[#00e5a0] uppercase">
              Platform Capabilities
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-[#e8e8ed] sm:text-4xl lg:text-5xl">
              Enterprise-Grade Security Intelligence
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} direction="up" delay={i * 80}>
              <TiltCard
                className="group h-full"
                tiltIntensity={6}
                glareEnabled
              >
                <div className="hud-card flex h-full flex-col p-8">
                  <div
                    className="mb-5 flex h-10 w-10 items-center justify-center border"
                    style={{
                      borderColor: `${f.color}30`,
                      backgroundColor: `${f.color}10`,
                    }}
                  >
                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-[#e8e8ed]">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#8a8a9a]">
                    {f.desc}
                  </p>
                  {/* Bottom glow line on hover */}
                  <div
                    className="mt-auto pt-6"
                    aria-hidden="true"
                  >
                    <div
                      className="h-px w-0 transition-all duration-500 group-hover:w-full"
                      style={{ backgroundColor: f.color }}
                    />
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
