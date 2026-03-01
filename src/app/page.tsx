"use client"

import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsBar } from "@/components/landing/stats-bar"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { PlatformWalkthrough } from "@/components/landing/platform-walkthrough"
import { WorkflowSection } from "@/components/landing/workflow-section"
import { PersonasSection } from "@/components/landing/personas-section"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { ScrollImageSequence } from "@/components/animations/scroll-image-sequence"
import { useRef } from "react"

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* 
        This is the "Apple AirPods" sticky scroll wrapper.
        It spans 300vh. The hero elements lock into place (`sticky top-0`) 
        while the scroll wheel scrubs the 240 frames. Once we scroll past 300vh, 
        the page continues moving down to the stats bar.
      */}
      <div ref={heroRef} className="relative h-[300vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Ensure Hero is elevated inside the sticky wrapper */}
          <div className="relative z-20 h-full">
            <HeroSection />
          </div>
          <ScrollImageSequence
            frameCount={240}
            framePrefix="ezgif-frame-"
            frameExtension=".jpg"
            folderPath="/bg-frames"
          />
        </div>
      </div>

      <div className="relative z-20">

        <StatsBar />
        <FeaturesGrid />
        <PlatformWalkthrough />
        <WorkflowSection />
        <PersonasSection />
        <CtaSection />
        <Footer />
      </div>
    </main>
  )
}
