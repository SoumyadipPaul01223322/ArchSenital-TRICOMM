"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { TiltCard } from "@/components/animations/tilt-card"
import { MagneticElement } from "@/components/animations/magnetic-element"
import { ParallaxLayer } from "@/components/animations/parallax-layer"
import { ArrowRight, Shield, Zap, AlertTriangle } from "lucide-react"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden pt-24 lg:pt-32">
      {/* Grid background */}
      <div
        className="animate-grid-fade pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Scan line */}
      <div
        className="animate-scan pointer-events-none absolute right-0 left-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent"
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-[#00e5a0]/[0.03] blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
        {/* Left column - 70% */}
        <div className="flex-[7]">
          <ScrollReveal direction="up" delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 border border-[#00e5a0]/20 bg-[#00e5a0]/5 px-4 py-1.5">
              <div className="animate-pulse-dot h-2 w-2 rounded-full bg-[#00e5a0]" />
              <span className="font-mono text-xs tracking-wider text-[#00e5a0]">
                AI-Powered Threat Modeling Platform
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <h1 className="max-w-2xl text-balance text-4xl leading-[1.1] font-bold tracking-tight text-[#e8e8ed] sm:text-5xl lg:text-6xl xl:text-7xl">
              See Your Attack Surface{" "}
              <span className="text-[#00e5a0]">Before Attackers Do</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-[#8a8a9a]">
              Map infrastructure, simulate real-world breaches, and auto-remediate
              vulnerabilities - all from a single, intelligent canvas.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={600}>
            <div className="relative z-20 mt-10 flex flex-wrap items-center gap-4">
              <SignedOut>
                <MagneticElement strength={0.15}>
                  <SignInButton mode="modal">
                    <button className="group inline-flex items-center gap-2 bg-[#00e5a0] px-7 py-3.5 text-sm font-semibold text-[#090910] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,160,0.3)]">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </SignInButton>
                </MagneticElement>
              </SignedOut>

              <SignedIn>
                <MagneticElement strength={0.15}>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 bg-[#00e5a0] px-7 py-3.5 text-sm font-semibold text-[#090910] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,160,0.3)]"
                  >
                    Open Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </MagneticElement>
              </SignedIn>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.1)] px-7 py-3.5 text-sm font-medium text-[#c0c0c8] transition-all duration-300 hover:border-[rgba(255,255,255,0.2)] hover:text-[#e8e8ed]"
              >
                Watch Demo
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Right column - 30% — 3D browser mockup */}
        <div className="flex-[5] perspective-container">
          <ScrollReveal direction="scale" delay={400} duration={1000}>
            <TiltCard className="relative" tiltIntensity={8}>
              {/* Browser chrome */}
              <div className="overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#0d0d14] shadow-2xl shadow-[#00e5a0]/5">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a12] px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff3131]/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ffc107]/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#00e5a0]/70" />
                  <div className="ml-4 flex-1 rounded-sm bg-[rgba(255,255,255,0.04)] px-3 py-1">
                    <span className="font-mono text-[10px] text-[#6a6a7a]">
                      app.archsentinel.com/canvas
                    </span>
                  </div>
                </div>

                {/* Canvas preview */}
                <div className="relative aspect-video bg-[#090910] p-4">
                  {/* Simulated architecture nodes */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 border border-[rgba(255,255,255,0.08)] bg-[#0d0d14] px-3 py-2">
                    <Shield className="h-3.5 w-3.5 text-[#00e5a0]" />
                    <span className="font-mono text-[10px] text-[#8a8a9a]">
                      WAF Gateway
                    </span>
                  </div>

                  <div className="absolute top-6 right-6 flex items-center gap-2 border border-[rgba(255,255,255,0.08)] bg-[#0d0d14] px-3 py-2">
                    <Zap className="h-3.5 w-3.5 text-[#00b8d4]" />
                    <span className="font-mono text-[10px] text-[#8a8a9a]">
                      API Server
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-1/4 flex items-center gap-2 border border-[rgba(255,255,255,0.08)] bg-[#0d0d14] px-3 py-2">
                    <div className="h-3 w-3 rounded-full bg-[#ffc107]" />
                    <span className="font-mono text-[10px] text-[#8a8a9a]">
                      DB Cluster
                    </span>
                  </div>

                  {/* Connection lines */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 400 225"
                    fill="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="100"
                      y1="40"
                      x2="300"
                      y2="40"
                      stroke="rgba(0,229,160,0.15)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="100"
                      y1="40"
                      x2="150"
                      y2="180"
                      stroke="rgba(0,184,212,0.15)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="300"
                      y1="40"
                      x2="150"
                      y2="180"
                      stroke="rgba(255,193,7,0.15)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  {/* Floating badges */}
                  <ParallaxLayer speed={0.3}>
                    <div className="animate-float absolute right-4 bottom-16 border border-[#ff3131]/30 bg-[#ff3131]/10 px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-[#ff3131]" />
                        <span className="font-mono text-[10px] text-[#ff3131]">
                          {"Attack Detected: DDoS"}
                        </span>
                      </div>
                    </div>
                  </ParallaxLayer>

                  <ParallaxLayer speed={0.5}>
                    <div className="animate-float-slow absolute top-16 left-1/3 border border-[#00e5a0]/30 bg-[#00e5a0]/10 px-3 py-1.5">
                      <span className="font-mono text-[10px] text-[#00e5a0]">
                        Risk Score: 24 - Low
                      </span>
                    </div>
                  </ParallaxLayer>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
