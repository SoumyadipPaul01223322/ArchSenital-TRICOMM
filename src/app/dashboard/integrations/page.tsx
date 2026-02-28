"use client";

import { Plug, Construction, ArrowRight, Cloud, Github, Slack } from "lucide-react";
import Link from "next/link";

export default function IntegrationsPage() {
    return (
        <div className="min-h-[80vh] bg-[#060606] p-4 md:p-8 font-mono flex items-center justify-center">
            <div className="max-w-2xl w-full text-center relative">

                {/* Background Grid & Glows */}
                <div className="absolute inset-0 bg-white/[0.01] bg-[size:30px_30px] bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

                <div className="w-24 h-24 mx-auto border border-[#a855f7]/30 bg-[#a855f7]/5 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex items-center justify-center mb-8 relative group">
                    <div className="absolute inset-[-1px] border border-[#a855f7]/40 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    <Plug className="w-10 h-10 text-[#a855f7]" />
                </div>

                <h1 className="text-4xl font-bold tracking-widest text-white uppercase mb-4">Integrations & Webhooks</h1>

                <div className="inline-flex items-center gap-2 bg-[#a855f7]/10 border border-[#a855f7]/30 px-3 py-1 text-[10px] text-[#a855f7] tracking-[0.3em] font-bold uppercase mb-8">
                    <Construction className="w-3 h-3" />
                    Currently Under Construction
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-12 max-w-lg mx-auto">
                    We are building a centralized hub to seamlessly connect ArchSentinel with your existing DevSecOps ecosystem. Soon you will be able to export architectures, sync risks, and automate zero-day alerts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 text-left">
                    <div className="bg-[#101014] border border-white/10 p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rotate-45 transform origin-top-right group-hover:bg-[#3b82f6]/20 transition-colors" />
                        <Cloud className="w-6 h-6 text-[#3b82f6] mb-3 relative z-10" />
                        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Cloud Providers</div>
                        <div className="text-sm font-bold text-white relative z-10">AWS, Azure, GCP</div>
                    </div>
                    <div className="bg-[#101014] border border-white/10 p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rotate-45 transform origin-top-right group-hover:bg-[#f97316]/20 transition-colors" />
                        <Github className="w-6 h-6 text-[#f97316] mb-3 relative z-10" />
                        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1">CI/CD Pipelines</div>
                        <div className="text-sm font-bold text-white relative z-10">GitHub, GitLab</div>
                    </div>
                    <div className="bg-[#101014] border border-white/10 p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rotate-45 transform origin-top-right group-hover:bg-[#eab308]/20 transition-colors" />
                        <Slack className="w-6 h-6 text-[#eab308] mb-3 relative z-10" />
                        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Alerting</div>
                        <div className="text-sm font-bold text-white relative z-10">Slack, Jira, Teams</div>
                    </div>
                </div>

                <Link href="/dashboard" className="inline-flex items-center gap-3 text-white/60 hover:text-[#00E5A0] transition-colors text-xs font-bold tracking-widest uppercase group">
                    <ArrowRight className="w-4 h-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
