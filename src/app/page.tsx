"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowRight, Activity, Zap, Lock, CheckCircle, Globe, Code2, Server, AlertTriangle, FileCheck, Users, ChevronRight, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";

// ── STATIC DATA ─────────────────────────────────────────────────────────

const STATS = [
  { value: "9.8M+", label: "Threats Neutralized" },
  { value: "430+", label: "Enterprise Customers" },
  { value: "< 2s", label: "Simulation Speed" },
  { value: "99.99%", label: "Platform Uptime" },
];

const FEATURES = [
  {
    icon: Globe,
    title: "Visual Architecture Canvas",
    desc: "Drag-and-drop 40+ infrastructure components — load balancers, firewalls, databases, K8s clusters — onto an infinite canvas. Design your real topology, not a theoretical one.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/[0.06]",
    border: "border-cyan-400/20",
  },
  {
    icon: AlertTriangle,
    title: "AI Threat Simulation Engine",
    desc: "Launch DDoS, SQL Injection, Ransomware, MITM, and Privilege Escalation simulations powered by Gemini and Perplexity AI. Watch the kill chain unfold node-by-node in real time.",
    color: "text-red-400",
    bg: "bg-red-400/[0.06]",
    border: "border-red-400/20",
  },
  {
    icon: Zap,
    title: "One-Click AI Auto-Fix",
    desc: "Zin AI analyzes every finding, patches misconfigured nodes live on the canvas — WAF rules, encryption toggles, MFA enforcement — and generates a full executive PDF report instantly.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/[0.06]",
    border: "border-emerald-400/20",
  },
  {
    icon: Server,
    title: "Live AWS Discovery",
    desc: "Connect your AWS account via IAM integration. One click and ArchSentinel auto-imports EC2 instances, RDS databases, load balancers, and WAF rules directly onto your canvas.",
    color: "text-orange-400",
    bg: "bg-orange-400/[0.06]",
    border: "border-orange-400/20",
  },
  {
    icon: FileCheck,
    title: "Compliance Auto-Mapping",
    desc: "Every architecture and finding is automatically mapped against OWASP Top 10, SOC2 CC6.x, ISO 27001, and NIST CSF. Know exactly where you stand before an audit.",
    color: "text-blue-400",
    bg: "bg-blue-400/[0.06]",
    border: "border-blue-400/20",
  },
  {
    icon: Code2,
    title: "AI Architecture Generation",
    desc: "Type a natural language prompt — \"Build a 3-tier e-commerce app on AWS\" — and Perplexity AI generates the complete architecture diagram with secure default configurations applied.",
    color: "text-amber-400",
    bg: "bg-amber-400/[0.06]",
    border: "border-amber-400/20",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Map Your Infrastructure",
    desc: "Drag components from the component palette or import your live AWS environment automatically via the SDK. Connect nodes with edges that represent real network traffic.",
  },
  {
    step: "02",
    title: "Simulate Attack Scenarios",
    desc: "Select an attacker node and choose from 10+ real-world attack vectors. The AI engine evaluates your security controls and runs a real-time kill chain simulation.",
  },
  {
    step: "03",
    title: "Review Findings & Auto-Fix",
    desc: "Every vulnerability is documented with a MITRE ATT&CK mapping. Click Auto-Fix and watch Zin AI harden your entire architecture in seconds — then download the PDF report.",
  },
];

const WHO_ITS_FOR = [
  {
    title: "Security Engineers",
    desc: "Model real attack surfaces and validate your defenses before deployment, not after a breach.",
    icon: Lock,
  },
  {
    title: "DevSecOps Teams",
    desc: "Integrate threat modeling into your CI/CD pipeline. Every architecture change is risk-assessed automatically.",
    icon: Code2,
  },
  {
    title: "CISOs & IT Leaders",
    desc: "Get executive-grade PDF reports on your organization's security posture, risk score, and compliance status.",
    icon: Users,
  },
];

// ── ANIMATED COUNTER ─────────────────────────────────────────────────────

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">{value}</div>
      <div className="text-sm text-white/40 mt-1 uppercase tracking-widest font-medium">{label}</div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#090910] text-white overflow-x-hidden">

      {/* ── CSS ─────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{
        __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

                body { font-family: 'Inter', sans-serif; }

                .font-mono { font-family: 'JetBrains Mono', monospace; }

                .gradient-text {
                    background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 50%, #00e5a0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .scan-line {
                    background: linear-gradient(90deg, transparent 0%, rgba(0,229,160,0.06) 50%, transparent 100%);
                    animation: scan 3s ease-in-out infinite;
                }

                @keyframes scan {
                    0% { opacity: 0; transform: translateY(-100%); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(100%); }
                }

                .entry-anim {
                    animation: entryUp 0.6s cubic-bezier(0.4,0,0.2,1) both;
                }
                .entry-anim-d1 { animation-delay: 0.1s; }
                .entry-anim-d2 { animation-delay: 0.2s; }
                .entry-anim-d3 { animation-delay: 0.3s; }
                .entry-anim-d4 { animation-delay: 0.4s; }

                @keyframes entryUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .pulse-dot {
                    animation: pulseDot 2s ease-in-out infinite;
                }

                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }

                .glow-bar {
                    background: linear-gradient(90deg, #00e5a0, #00c87a);
                    box-shadow: 0 0 20px rgba(0,229,160,0.4);
                }

                @media (prefers-reduced-motion: reduce) {
                    .entry-anim, .scan-line, .pulse-dot { animation: none; }
                }
            ` }} />

      {/* ── NAVIGATION ──────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#090910]/95 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-[#00e5a0]/10 border border-[#00e5a0]/30 rounded-lg flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-[#00e5a0]" />
            </div>
            <span className="font-bold text-base tracking-tight">ArchSentinel</span>
            <span className="hidden sm:block text-[10px] font-mono text-[#00e5a0]/60 bg-[#00e5a0]/8 border border-[#00e5a0]/15 rounded px-1.5 py-0.5 uppercase tracking-widest">Enterprise</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#for-who" className="hover:text-white transition-colors">Who It's For</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Sign In</button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="bg-[#00e5a0] text-[#090910] px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#00c87a] transition-colors">
                  Start Free Trial
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="bg-[#00e5a0] text-[#090910] px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#00c87a] transition-colors flex items-center gap-2">
                Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </SignedIn>
            <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMobileMenuOpen(v => !v)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d0d14] border-t border-white/[0.06] px-6 py-4 space-y-3">
            {["#features", "#how-it-works", "#for-who"].map(href => (
              <a key={href} href={href} className="block text-sm text-white/60 hover:text-white py-2 border-b border-white/[0.04]" onClick={() => setMobileMenuOpen(false)}>
                {href.replace("#", "").replace("-", " ").replace(/^\w/, c => c.toUpperCase())}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />
        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="scan-line absolute inset-x-0 h-48" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start gap-16 lg:gap-8">
          {/* Left — Text */}
          <div className="flex-1 max-w-2xl">
            <div className="entry-anim inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00e5a0]/20 bg-[#00e5a0]/5 text-xs font-mono text-[#00e5a0] mb-8 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0] pulse-dot" />
              AI-Powered Threat Modeling Platform
            </div>

            <h1 className="entry-anim entry-anim-d1 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tighter mb-6">
              <span className="gradient-text">See Your Attack Surface</span>
              <br />
              <span className="text-white">Before Attackers Do</span>
            </h1>

            <p className="entry-anim entry-anim-d2 text-lg text-white/50 leading-relaxed mb-10 max-w-xl">
              ArchSentinel is an enterprise threat modeling platform that lets you visually map your infrastructure, simulate real-world attacks with AI, auto-fix vulnerabilities instantly, and generate compliance reports — all in one workspace.
            </p>

            <div className="entry-anim entry-anim-d3 flex flex-col sm:flex-row items-start gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full sm:w-auto bg-[#00e5a0] text-[#090910] px-8 py-3.5 rounded-lg font-bold text-base hover:bg-[#00c87a] transition-all hover:shadow-[0_0_30px_rgba(0,229,160,0.3)] flex items-center justify-center gap-2">
                    Start Modeling Free <ArrowRight className="h-4 w-4" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="w-full sm:w-auto bg-[#00e5a0] text-[#090910] px-8 py-3.5 rounded-lg font-bold text-base hover:bg-[#00c87a] transition-all flex items-center justify-center gap-2">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </SignedIn>
              <a href="#how-it-works" className="w-full sm:w-auto border border-white/15 text-white/70 px-8 py-3.5 rounded-lg font-medium text-base hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="entry-anim entry-anim-d4 mt-10 flex flex-wrap items-center gap-6">
              {["SOC2 Ready", "ISO 27001", "OWASP Aligned", "No CC Required"].map(badge => (
                <div key={badge} className="flex items-center gap-1.5 text-xs text-white/30 font-mono">
                  <CheckCircle className="h-3 w-3 text-[#00e5a0]/60" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Product Screenshot */}
          <div className="entry-anim entry-anim-d2 flex-1 w-full lg:max-w-2xl relative">
            <div className="absolute -inset-4 bg-[#00e5a0]/5 rounded-2xl blur-3xl pointer-events-none" />
            <div className="relative rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/60">
              {/* Window chrome */}
              <div className="bg-[#0d0d14] px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#00e5a0]/60" />
                <span className="ml-3 text-xs text-white/30 font-mono">ArchSentinel — Architecture Builder</span>
              </div>
              <Image
                src="/screenshot-canvas.png"
                alt="ArchSentinel architecture canvas showing a network topology with threat actor nodes and attack simulation"
                width={900}
                height={560}
                className="w-full h-auto"
                unoptimized
              />
            </div>
            {/* Floating badges */}
            <div className="absolute -bottom-4 -left-4 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
              <Activity className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-xs font-bold text-white">Attack Detected</div>
                <div className="text-[10px] text-white/40 font-mono">DDoS → Blocked by WAF</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#0d0d14] border border-[#00e5a0]/20 rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
              <ShieldAlert className="h-5 w-5 text-[#00e5a0]" />
              <div>
                <div className="text-xs font-bold text-[#00e5a0]">Risk Score: 24</div>
                <div className="text-[10px] text-white/40 font-mono">Hardened Architecture</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 mt-24 border-t border-b border-white/[0.06] py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => <AnimatedStat key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="text-xs font-mono text-[#00e5a0] uppercase tracking-widest mb-4">Platform Capabilities</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white max-w-2xl">
            Everything you need to secure your infrastructure
          </h2>
          <p className="text-white/40 mt-4 max-w-xl text-lg">From design to detection to remediation — ArchSentinel covers the entire threat modeling lifecycle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className={`group relative p-6 border rounded-xl ${f.border} ${f.bg} bg-[#0d0d14] hover:border-white/20 transition-all duration-300 cursor-default`}>
                <div className={`h-10 w-10 rounded-lg ${f.bg} border ${f.border} flex items-center justify-center mb-5`}>
                  <Icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                <div className={`absolute bottom-0 left-0 w-full h-px glow-bar opacity-0 group-hover:opacity-40 transition-opacity`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PRODUCT SCREENSHOTS ──────────────────────────── */}
      <section className="py-28 px-6 bg-[#0a0a12] border-t border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <div className="text-xs font-mono text-[#00e5a0] uppercase tracking-widest mb-4">Platform in Action</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Real AI. Real Attacks. Real Security.</h2>
            <p className="text-white/40 mt-4 text-lg max-w-2xl mx-auto">Not a theoretical checklist. ArchSentinel runs live simulations against your actual topology and shows you exactly what would happen.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Screenshot 1 */}
            <div className="rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl">
              <div className="bg-[#0d0d14] px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-white/30 font-mono">AI Threat Simulation — Kill Chain Results</span>
                <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded">LIVE SIMULATION</span>
              </div>
              <Image
                src="/screenshot-threat.png"
                alt="AI-driven threat simulation kill chain showing attack phases with BLOCKED and DETECTED outcomes"
                width={800}
                height={500}
                className="w-full h-auto"
                unoptimized
              />
            </div>
            <div className="space-y-6">
              <div className="border-l-2 border-[#00e5a0]/50 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">Real-World Attack Simulation</h3>
                <p className="text-white/50 text-sm leading-relaxed">Choose from 10+ attack types including DDoS, SQL Injection, Man-in-the-Middle, Ransomware, Privilege Escalation, and Zero-Day Exploits. The AI evaluates every security control in your architecture.</p>
              </div>
              <div className="border-l-2 border-red-400/50 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">Phase-by-Phase Kill Chain</h3>
                <p className="text-white/50 text-sm leading-relaxed">Watch each MITRE ATT&CK phase unfold in real time — Reconnaissance, Initial Access, Execution, Privilege Escalation, and Exfil — with BLOCKED, DETECTED, or COMPROMISED outcomes per node.</p>
              </div>
              <div className="border-l-2 border-amber-400/50 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">Smart Vulnerability Findings</h3>
                <p className="text-white/50 text-sm leading-relaxed">Every simulation produces a ranked findings list with CVE references, compliance impact (SOC2, OWASP), estimated breach cost, and AI-generated remediation code patches.</p>
              </div>
            </div>

            {/* Screenshot 2 */}
            <div className="space-y-6">
              <div className="border-l-2 border-[#00e5a0]/50 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">Zin AI Auto-Remediation</h3>
                <p className="text-white/50 text-sm leading-relaxed">One click. Zin AI reads every finding, patches each vulnerable node in real time on the canvas, and applies security-hardened defaults — WAF rules, encryption flags, auth policies — automatically.</p>
              </div>
              <div className="border-l-2 border-blue-400/50 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">Executive PDF Reports</h3>
                <p className="text-white/50 text-sm leading-relaxed">Instantly generate board-ready PDF reports with executive summaries, risk scores, compliance gaps, financial impact estimates, and remediation timelines — ready for audit.</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl">
              <div className="bg-[#0d0d14] px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-white/30 font-mono">Zin AI Auto-Fix — Remediation Applied</span>
                <span className="text-[10px] font-mono text-[#00e5a0] bg-[#00e5a0]/10 px-2 py-0.5 rounded">✓ SECURED</span>
              </div>
              <Image
                src="/screenshot-autofix.png"
                alt="Zin AI auto-remediation dashboard showing applied security patches and PDF report generation"
                width={800}
                height={500}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="text-xs font-mono text-[#00e5a0] uppercase tracking-widest mb-4">The Workflow</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white max-w-xl">From architecture to hardened security in 3 steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-[#00e5a0]/30 via-white/10 to-[#00e5a0]/30" />

          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="relative">
              <div className="h-16 w-16 rounded-xl bg-[#00e5a0]/5 border border-[#00e5a0]/20 flex items-center justify-center mb-6">
                <span className="font-mono text-2xl font-bold text-[#00e5a0]/60">{step.step}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────────────── */}
      <section id="for-who" className="py-28 px-6 bg-[#0a0a12] border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="text-xs font-mono text-[#00e5a0] uppercase tracking-widest mb-4">Who It's For</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white max-w-xl">Built for every security stakeholder</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHO_ITS_FOR.map((persona, i) => {
              const Icon = persona.icon;
              return (
                <div key={i} className="p-8 bg-[#0d0d14] border border-white/[0.06] hover:border-[#00e5a0]/20 rounded-xl transition-all group">
                  <Icon className="h-8 w-8 text-[#00e5a0]/60 mb-6 group-hover:text-[#00e5a0] transition-colors" />
                  <h3 className="text-xl font-bold text-white mb-3">{persona.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{persona.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-[#00e5a0]/60 font-mono group-hover:text-[#00e5a0] transition-colors">
                    Learn more <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0,229,160,0.04) 0%, transparent 70%)"
        }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block border border-[#00e5a0]/20 rounded-full px-4 py-2 text-xs font-mono text-[#00e5a0]/60 uppercase tracking-widest mb-8">
            Start Today — Free
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-6">
            Your infrastructure has blind spots.
            <br />
            <span className="text-[#00e5a0]">We help you find them first.</span>
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-2xl mx-auto">
            Join 430+ security teams who model, simulate, and harden their architectures continuously with ArchSentinel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto bg-[#00e5a0] text-[#090910] px-10 py-4 rounded-lg text-base font-bold hover:bg-[#00c87a] transition-all hover:shadow-[0_0_40px_rgba(0,229,160,0.3)] flex items-center justify-center gap-2">
                  Start Modeling Free <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="w-full sm:w-auto bg-[#00e5a0] text-[#090910] px-10 py-4 rounded-lg text-base font-bold hover:bg-[#00c87a] transition-all flex items-center justify-center gap-2">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#00e5a0]/60" />
            <span className="text-sm font-bold text-white/60">ArchSentinel</span>
            <span className="text-xs text-white/20 font-mono">Enterprise Threat Modeling</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            {["Privacy Policy", "Terms of Service", "SOC2 Report", "Security"].map(item => (
              <span key={item} className="hover:text-white/60 cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
          <div className="text-xs text-white/20 font-mono">© 2025 ArchSentinel · All rights reserved</div>
        </div>
      </footer>
    </main>
  );
}
