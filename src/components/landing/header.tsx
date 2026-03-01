"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, ArrowRight } from "lucide-react"
import { MagneticElement } from "@/components/animations/magnetic-element"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "border-b border-[rgba(255,255,255,0.06)] bg-[#090910]/95 backdrop-blur-xl"
        : "bg-transparent"
        }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#00e5a0]/30 bg-[#00e5a0]/10">
            <ShieldAlert className="h-5 w-5 text-[#00e5a0]" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#e8e8ed]">
            ArchSentinel
          </span>
          <span className="hidden font-mono text-[10px] tracking-widest text-[#6a6a7a] uppercase sm:inline">
            ENTERPRISE
          </span>
        </a>

        {/* Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {["Features", "How It Works", "Who It's For"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "")}`}
              className="text-sm text-[#8a8a9a] transition-colors duration-300 hover:text-[#e8e8ed]"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden text-sm text-[#8a8a9a] transition-colors duration-300 hover:text-[#e8e8ed] sm:inline">
                Sign In
              </button>
            </SignInButton>
            <MagneticElement strength={0.2}>
              <SignInButton mode="modal">
                <button className="animate-pulse-glow inline-flex items-center gap-2 bg-[#00e5a0] px-5 py-2.5 text-sm font-semibold text-[#090910] transition-all duration-300 hover:bg-[#00cc8e] hover:shadow-[0_0_30px_rgba(0,229,160,0.3)]">
                  Start Free Trial
                </button>
              </SignInButton>
            </MagneticElement>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#00e5a0] px-5 py-2.5 text-sm font-semibold text-[#090910] transition-all duration-300 hover:bg-[#00cc8e] hover:shadow-[0_0_30px_rgba(0,229,160,0.3)]"
            >
              Enter Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </SignedIn>
        </div>
      </nav>
    </header>
  )
}
