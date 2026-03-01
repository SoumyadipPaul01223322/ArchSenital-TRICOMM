"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { TiltCard } from "@/components/animations/tilt-card"
import {
  AlertTriangle,
  Shield,
  Zap,
  Activity,
  FileText,
  CheckCircle2,
} from "lucide-react"

const walkthroughs = [
  {
    badge: "AI Threat Simulation",
    badgeColor: "#ff3131",
    title: "Phase-by-Phase Kill Chain Analysis",
    desc: "Watch AI simulate real-world attack vectors against your infrastructure. Identify breach paths before adversaries find them. Every node, every connection, every vulnerability - mapped and scored.",
    tags: [
      { text: "SIMULATION ACTIVE", color: "#ff3131", icon: Activity },
      { text: "3 BREACH PATHS", color: "#ffc107", icon: AlertTriangle },
      { text: "AI ANALYZING", color: "#00b8d4", icon: Zap },
    ],
    visual: {
      nodes: [
        { label: "Internet", x: 10, y: 20, color: "#8a8a9a" },
        { label: "CDN Edge", x: 35, y: 15, color: "#00b8d4" },
        { label: "Load Balancer", x: 60, y: 20, color: "#00e5a0" },
        { label: "App Server", x: 40, y: 50, color: "#ffc107" },
        { label: "Database", x: 65, y: 75, color: "#ff3131" },
        { label: "Auth Service", x: 15, y: 65, color: "#00e5a0" },
      ],
      attackPath: true,
    },
  },
  {
    badge: "Zin AI Auto-Remediation",
    badgeColor: "#00e5a0",
    title: "Intelligent One-Click Auto-Fix",
    desc: "Zin AI analyzes identified vulnerabilities and applies context-aware patches in real-time. Generate executive PDF posture reports with a single click. From detection to resolution in seconds.",
    tags: [
      { text: "AUTO-FIX APPLIED", color: "#00e5a0", icon: CheckCircle2 },
      { text: "PDF GENERATED", color: "#00b8d4", icon: FileText },
      { text: "SECURED", color: "#00e5a0", icon: Shield },
    ],
    visual: {
      nodes: [
        { label: "WAF", x: 15, y: 25, color: "#00e5a0" },
        { label: "API Gateway", x: 45, y: 15, color: "#00e5a0" },
        { label: "Microservice A", x: 70, y: 30, color: "#00e5a0" },
        { label: "Microservice B", x: 30, y: 60, color: "#00e5a0" },
        { label: "Data Store", x: 60, y: 70, color: "#00e5a0" },
        { label: "Monitoring", x: 85, y: 60, color: "#00b8d4" },
      ],
      attackPath: false,
    },
  },
]

export function PlatformWalkthrough() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up">
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <span className="mb-4 inline-block font-mono text-xs tracking-widest text-[#00e5a0] uppercase">
              Platform in Action
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-[#e8e8ed] sm:text-4xl lg:text-5xl">
              See How It Works in Practice
            </h2>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-20">
          {walkthroughs.map((w, idx) => (
            <div
              key={w.badge}
              className={`flex flex-col items-center gap-12 lg:flex-row ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
            >
              {/* Text */}
              <ScrollReveal
                direction={idx % 2 === 0 ? "left" : "right"}
                delay={200}
                className="flex-1"
              >
                <div>
                  <div
                    className="mb-4 inline-flex items-center gap-2 border px-3 py-1"
                    style={{
                      borderColor: `${w.badgeColor}30`,
                      backgroundColor: `${w.badgeColor}10`,
                    }}
                  >
                    <div
                      className="animate-pulse-dot h-2 w-2 rounded-full"
                      style={{ backgroundColor: w.badgeColor }}
                    />
                    <span
                      className="font-mono text-[10px] tracking-wider uppercase"
                      style={{ color: w.badgeColor }}
                    >
                      {w.badge}
                    </span>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-[#e8e8ed] lg:text-3xl">
                    {w.title}
                  </h3>
                  <p className="mb-6 text-pretty text-[#8a8a9a] leading-relaxed">
                    {w.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {w.tags.map((tag) => (
                      <div
                        key={tag.text}
                        className="inline-flex items-center gap-1.5 border px-3 py-1.5"
                        style={{
                          borderColor: `${tag.color}20`,
                          backgroundColor: `${tag.color}08`,
                        }}
                      >
                        <tag.icon
                          className="h-3 w-3"
                          style={{ color: tag.color }}
                        />
                        <span
                          className="font-mono text-[10px] tracking-wider"
                          style={{ color: tag.color }}
                        >
                          {tag.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Visual */}
              <ScrollReveal
                direction={idx % 2 === 0 ? "right" : "left"}
                delay={400}
                className="flex-1"
              >
                <TiltCard tiltIntensity={5} glareEnabled>
                  <div className="overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#090910]">
                    {/* Browser bar */}
                    <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a12] px-4 py-2.5">
                      <div className="h-2 w-2 rounded-full bg-[#ff3131]/60" />
                      <div className="h-2 w-2 rounded-full bg-[#ffc107]/60" />
                      <div className="h-2 w-2 rounded-full bg-[#00e5a0]/60" />
                    </div>

                    {/* Canvas area */}
                    <div className="relative aspect-[16/10] p-6">
                      {/* Grid bg */}
                      <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                          `,
                          backgroundSize: "30px 30px",
                        }}
                        aria-hidden="true"
                      />

                      {/* SVG connections */}
                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        {w.visual.nodes.map((node, ni) =>
                          w.visual.nodes.slice(ni + 1).map((target, ti) => (
                            <line
                              key={`${ni}-${ti}`}
                              x1={`${node.x}`}
                              y1={`${node.y}`}
                              x2={`${target.x}`}
                              y2={`${target.y}`}
                              stroke={
                                w.visual.attackPath
                                  ? "rgba(255,49,49,0.12)"
                                  : "rgba(0,229,160,0.12)"
                              }
                              strokeWidth="0.3"
                              strokeDasharray="2 2"
                            />
                          ))
                        )}
                      </svg>

                      {/* Nodes */}
                      {w.visual.nodes.map((node) => (
                        <div
                          key={node.label}
                          className="animate-float-slow absolute flex items-center gap-1.5 border px-2 py-1"
                          style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            borderColor: `${node.color}30`,
                            backgroundColor: `${node.color}10`,
                            animationDelay: `${Math.random() * 2}s`,
                          }}
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: node.color }}
                          />
                          <span
                            className="font-mono text-[8px] tracking-wide whitespace-nowrap"
                            style={{ color: node.color }}
                          >
                            {node.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
