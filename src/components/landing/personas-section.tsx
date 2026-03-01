"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { TiltCard } from "@/components/animations/tilt-card"
import { Shield, GitBranch, BarChart3 } from "lucide-react"

const personas = [
  {
    icon: Shield,
    role: "Security Engineers",
    desc: "Model real attack surfaces, validate defense configurations, and identify breach paths before deployment. Purpose-built for hands-on security practitioners.",
    highlights: [
      "Visual attack surface mapping",
      "Real-time threat simulation",
      "Configuration validation",
    ],
  },
  {
    icon: GitBranch,
    role: "DevSecOps Teams",
    desc: "Integrate directly into CI/CD pipelines to risk-assess infrastructure changes before they reach production. Shift-left security at enterprise scale.",
    highlights: [
      "CI/CD pipeline integration",
      "Pre-deployment risk scoring",
      "Automated compliance checks",
    ],
  },
  {
    icon: BarChart3,
    role: "CISOs & IT Leaders",
    desc: "Generate executive-grade PDF posture reports for board presentations. Get complete visibility into organizational security posture with actionable metrics.",
    highlights: [
      "Executive PDF reporting",
      "Board-ready dashboards",
      "ROI security metrics",
    ],
  },
]

export function PersonasSection() {
  return (
    <section
      id="solutions"
      className="relative py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up">
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <span className="mb-4 inline-block font-mono text-xs tracking-widest text-[#00e5a0] uppercase">
              Who It{"'"}s For
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-[#e8e8ed] sm:text-4xl lg:text-5xl">
              Built for Enterprise Security Teams
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-px lg:grid-cols-3">
          {personas.map((p, i) => (
            <ScrollReveal key={p.role} direction="up" delay={i * 120}>
              <TiltCard tiltIntensity={8} glareEnabled className="h-full">
                <div className="hud-card flex h-full flex-col p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#00e5a0]/20 bg-[#00e5a0]/5">
                    <p.icon className="h-6 w-6 text-[#00e5a0]" />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-[#e8e8ed]">
                    {p.role}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-[#8a8a9a]">
                    {p.desc}
                  </p>

                  <ul className="mt-auto flex flex-col gap-3">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#00e5a0]" />
                        <span className="font-mono text-xs text-[#c0c0c8]">
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
