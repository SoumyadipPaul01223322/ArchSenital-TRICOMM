import { ShieldAlert } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#0d0d14]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row lg:py-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center border border-[#00e5a0]/30 bg-[#00e5a0]/10">
            <ShieldAlert className="h-4 w-4 text-[#00e5a0]" />
          </div>
          <span className="text-sm font-semibold text-[#e8e8ed]">
            ArchSentinel
          </span>
          <span className="font-mono text-[10px] text-[#6a6a7a]">
            Enterprise Threat Modeling
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6">
          {["Privacy Policy", "Terms of Service", "SOC2 Report", "Security"].map(
            (link) => (
              <a
                key={link}
                href="#"
                className="font-mono text-xs text-[#6a6a7a] transition-colors duration-300 hover:text-[#8a8a9a]"
              >
                {link}
              </a>
            )
          )}
        </div>

        {/* Copyright */}
        <span className="font-mono text-[10px] text-[#4a4a5a]">
          {"2026 ArchSentinel Inc. All rights reserved."}
        </span>
      </div>
    </footer>
  )
}
