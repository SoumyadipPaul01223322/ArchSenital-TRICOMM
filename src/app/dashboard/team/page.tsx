"use client";

import { Users, Construction, ArrowRight, Shield, UserCog, History } from "lucide-react";
import Link from "next/link";

export default function TeamAccessPage() {
    return (
        <div className="min-h-[80vh] bg-[#060606] p-4 md:p-8 font-mono flex items-center justify-center">
            <div className="max-w-2xl w-full text-center relative">

                {/* Background Grid & Glows */}
                <div className="absolute inset-0 bg-white/[0.01] bg-[size:30px_30px] bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

                <div className="w-24 h-24 mx-auto border border-[#14b8a6]/30 bg-[#14b8a6]/5 shadow-[0_0_30px_rgba(20,184,166,0.1)] flex items-center justify-center mb-8 relative group">
                    <div className="absolute inset-[-1px] border border-[#14b8a6]/40 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    <Users className="w-10 h-10 text-[#14b8a6]" />
                </div>

                <h1 className="text-4xl font-bold tracking-widest text-white uppercase mb-4">Team & Access (RBAC)</h1>

                <div className="inline-flex items-center gap-2 bg-[#14b8a6]/10 border border-[#14b8a6]/30 px-3 py-1 text-[10px] text-[#14b8a6] tracking-[0.3em] font-bold uppercase mb-8">
                    <Construction className="w-3 h-3" />
                    Currently Under Construction
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-12 max-w-lg mx-auto">
                    Enterprise-grade Role-Based Access Control is coming soon. You'll be able to invite organization members, assign Granular Roles (Admin, Architect, Viewer), and review comprehensive audit logs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 text-left">
                    <div className="bg-[#101014] border border-white/10 p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rotate-45 transform origin-top-right group-hover:bg-[#10b981]/20 transition-colors" />
                        <UserCog className="w-6 h-6 text-[#10b981] mb-3 relative z-10" />
                        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Members</div>
                        <div className="text-sm font-bold text-white relative z-10">User Management</div>
                    </div>
                    <div className="bg-[#101014] border border-white/10 p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rotate-45 transform origin-top-right group-hover:bg-[#f59e0b]/20 transition-colors" />
                        <Shield className="w-6 h-6 text-[#f59e0b] mb-3 relative z-10" />
                        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Security</div>
                        <div className="text-sm font-bold text-white relative z-10">Granular RBAC</div>
                    </div>
                    <div className="bg-[#101014] border border-white/10 p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rotate-45 transform origin-top-right group-hover:bg-[#6366f1]/20 transition-colors" />
                        <History className="w-6 h-6 text-[#6366f1] mb-3 relative z-10" />
                        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Compliance</div>
                        <div className="text-sm font-bold text-white relative z-10">Audit Logs</div>
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
