"use client";

import Link from "next/link";
import { ShieldAlert, Activity, ArrowRight, Layers, Lock as LockIcon, CheckCircle } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-purple-500" />
          <span className="font-bold text-xl tracking-tight">ArchSentinel</span>
        </div>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium hover:text-purple-400 transition-colors">Sign In</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">Get Started</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors flex items-center space-x-2">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32 text-center">
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-purple-400 mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="font-medium">Enterprise Security Platform 1.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent max-w-4xl mx-auto leading-[1.1]">
          Continuous Architecture Threat Modeling
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12">
          Visually map your enterprise infrastructure, instantly simulate attack vectors with AI-driven Graph Traversal, and automate compliance mappings dynamically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <SignedIn>
            <Link href="/dashboard" className="w-full sm:w-auto bg-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-purple-500 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25">
              <span>Enter Workspace</span>
              <Activity className="h-5 w-5" />
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto bg-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-purple-500 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25">
                <span>Start Modeling for Free</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </SignInButton>
          </SignedOut>
          <button className="w-full sm:w-auto bg-white/5 text-white border border-white/10 px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-colors">
            View Live Demo
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
            <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
              <Layers className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Drag & Drop Canvas</h3>
            <p className="text-white/50 leading-relaxed">Map your components in real-time. Connect load balancers, APIs, and databases with strict access boundaries.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
            <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 border border-red-500/30">
              <LockIcon className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">DFS Attack Engine</h3>
            <p className="text-white/50 leading-relaxed">Our advanced Convex backend runs Depth-First Search algorithms to discover lateral movement vectors instantly.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
            <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 border border-green-500/30">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Automated Compliance</h3>
            <p className="text-white/50 leading-relaxed">Generated architectures are scored against OWASP, SOC2, and ISO 27001 rulesets to guarantee security posture.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
