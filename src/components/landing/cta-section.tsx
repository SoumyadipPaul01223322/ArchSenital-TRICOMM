"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { MagneticElement } from "@/components/animations/magnetic-element"
import { ArrowRight, Users } from "lucide-react"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Grid background */}
      <div
        className="animate-grid-fade pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00e5a0]/[0.03] blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <ScrollReveal direction="scale" duration={900}>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-[#e8e8ed] sm:text-4xl lg:text-5xl xl:text-6xl">
            Your infrastructure has blind spots.{" "}
            <span className="text-[#00e5a0]">We help you find them first.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <div className="mt-6 flex items-center justify-center gap-2 text-[#6a6a7a]">
            <Users className="h-4 w-4" />
            <span className="font-mono text-sm">
              Join 430+ security teams already using ArchSentinel
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={400}>
          <div className="relative z-20 mt-10 flex flex-wrap items-center justify-center gap-4">
            <SignedOut>
              <MagneticElement strength={0.2}>
                <SignInButton mode="modal">
                  <button className="group inline-flex items-center gap-2 bg-[#00e5a0] px-8 py-4 text-base font-semibold text-[#090910] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,229,160,0.3)]">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </SignInButton>
              </MagneticElement>
            </SignedOut>

            <SignedIn>
              <MagneticElement strength={0.2}>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 bg-[#00e5a0] px-8 py-4 text-base font-semibold text-[#090910] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,229,160,0.3)]"
                >
                  Open Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </MagneticElement>
            </SignedIn>

            <a
              href="#"
              className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.1)] px-8 py-4 text-base font-medium text-[#c0c0c8] transition-all duration-300 hover:border-[rgba(255,255,255,0.2)] hover:text-[#e8e8ed]"
            >
              Request Demo
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
