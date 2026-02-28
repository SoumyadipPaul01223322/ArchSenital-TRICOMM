"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ShieldAlert, Activity, CheckCircle, Clock, Sparkles, Server, Search, ArrowRight, TrendingDown, Plus, ChevronRight, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis
} from "recharts";

// ── SKELETON ─────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-white/[0.04] rounded ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-6 space-y-4">
            <Skeleton className="h-3 w-24 rounded-sm" />
            <Skeleton className="h-8 w-16 rounded-sm" />
            <Skeleton className="h-2 w-full rounded-sm" />
        </div>
    );
}

function ProjectCardSkeleton() {
    return (
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-28 rounded-sm" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-3/4 rounded-sm" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-12 rounded-sm" />
                <Skeleton className="h-1.5 w-32 rounded-full" />
            </div>
        </div>
    );
}

// ── STAT CARD ────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    accent: string;
    borderColor: string;
    icon: React.ElementType;
    barPercent?: number;
}

function StatCard({ label, value, sub, accent, borderColor, icon: Icon, barPercent }: StatCardProps) {
    return (
        <div className={`group relative bg-[#0d0d14] border ${borderColor} hover:brightness-110 rounded-xl p-6 transition-all duration-300 overflow-hidden`}>
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accent}`} />

            <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{label}</span>
                <div className={`h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${accent.replace('bg-', 'text-').replace('/50', '/80')}`} />
                </div>
            </div>

            <div className="flex items-end gap-2 mb-4">
                <span className={`text-3xl font-bold font-mono tracking-tighter ${accent.replace('bg-', 'text-').replace('/50', '')}`}>{value}</span>
                {sub && <span className="text-xs text-white/30 mb-1">{sub}</span>}
            </div>

            {barPercent !== undefined && (
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                        className={`h-full ${accent} transition-all duration-1000 rounded-full`}
                        style={{ width: `${barPercent}%` }}
                    />
                </div>
            )}
        </div>
    );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────

export default function DashboardClient({ orgId }: { orgId: string }) {
    const summary = useQuery(api.architecture.getOrgRiskSummary, { orgId });
    const projects = useQuery(api.architecture.getOrgProjects, { orgId });

    const isLoading = summary === undefined || projects === undefined;

    // ── LOADING STATE ────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <style dangerouslySetInnerHTML={{
                    __html: `
                @keyframes shimmer { to { transform: translateX(200%); } }
                ` }} />
                {/* AI Prompt Skeleton */}
                <Skeleton className="h-14 w-full rounded-xl" />

                {/* Stats skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
                </div>

                {/* Charts skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="col-span-2 h-64 rounded-xl" />
                </div>

                {/* Projects skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    const radialData = [{ name: "Risk", value: summary.averageOrgRisk, fill: summary.averageOrgRisk > 70 ? "#ef4444" : summary.averageOrgRisk > 40 ? "#f59e0b" : "#00e5a0" }];

    const trendData = (() => {
        if (!projects || projects.length === 0) return [{ name: "No data", risk: 0 }];
        const sorted = [...projects].sort((a: any, b: any) => (a._creationTime ?? 0) - (b._creationTime ?? 0));
        return sorted.slice(-6).map((p: any, i: number) => ({ name: `P${i + 1}`, risk: p.riskScore ?? 0 }));
    })();

    const trendChange = trendData.length < 2 ? null : trendData[trendData.length - 1].risk - trendData[0].risk;

    const riskColor = summary.averageOrgRisk > 70
        ? { text: "text-red-400", bg: "bg-red-500/50", border: "border-red-500/20" }
        : summary.averageOrgRisk > 40
            ? { text: "text-amber-400", bg: "bg-amber-500/50", border: "border-amber-500/20" }
            : { text: "text-[#00e5a0]", bg: "bg-[#00e5a0]/50", border: "border-[#00e5a0]/20" };

    return (
        <div className="p-8 space-y-8">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer { to { transform: translateX(200%); } }
                @font-face {}
            ` }} />

            {/* ── PAGE HEADER ──────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Security Posture</h1>
                    <p className="text-sm text-white/30 mt-0.5 font-mono">Organization Risk Intelligence Dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-[#0d0d14] border border-white/[0.06] rounded-lg text-xs font-mono text-white/40 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
                        LIVE MONITORING
                    </div>
                    <Link href="/dashboard/projects/new" className="flex items-center gap-2 px-4 py-2 bg-[#00e5a0]/10 border border-[#00e5a0]/30 hover:bg-[#00e5a0]/20 rounded-lg text-xs font-bold text-[#00e5a0] uppercase tracking-widest transition-all">
                        <Plus className="h-3 w-3" /> New Architecture
                    </Link>
                </div>
            </div>

            {/* ── AI PROMPT ────────────────────────────────────────── */}
            <div className="relative flex items-center bg-[#0d0d14] border border-white/[0.08] hover:border-white/[0.14] rounded-xl px-5 py-4 gap-4 transition-all duration-300 group">
                <div className="h-8 w-8 rounded-lg bg-[#00e5a0]/8 border border-[#00e5a0]/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-[#00e5a0]" />
                </div>
                <input
                    type="text"
                    placeholder="Ask Sentinel AI about your security posture, compliance gaps, or threat exposure..."
                    className="bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none flex-1 font-mono"
                />
                <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#00e5a0]/10 hover:bg-[#00e5a0]/20 border border-[#00e5a0]/25 rounded-lg text-xs font-bold text-[#00e5a0] uppercase tracking-wider transition-all">
                    <Zap className="h-3 w-3" /> Ask AI
                </button>
            </div>

            {/* ── STAT CARDS ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Total Assets Mapped"
                    value={summary.totalProjects * 8}
                    sub="nodes"
                    accent="bg-cyan-400/50"
                    borderColor="border-cyan-500/10 hover:border-cyan-500/30"
                    icon={Server}
                    barPercent={Math.min(summary.totalProjects * 12, 100)}
                />
                <StatCard
                    label="Critical Exposure Vectors"
                    value={summary.highRiskCount}
                    sub="HIGH / CRIT"
                    accent="bg-red-500/50"
                    borderColor="border-red-500/10 hover:border-red-500/30"
                    icon={AlertTriangle}
                />
                <StatCard
                    label="Protected Resources"
                    value={summary.lowRiskCount}
                    sub="secured"
                    accent="bg-[#00e5a0]/50"
                    borderColor="border-[#00e5a0]/10 hover:border-[#00e5a0]/30"
                    icon={CheckCircle}
                    barPercent={summary.totalProjects > 0 ? Math.round((summary.lowRiskCount / summary.totalProjects) * 100) : 0}
                />
                <StatCard
                    label="Mean Org Risk Score"
                    value={summary.averageOrgRisk}
                    sub="/ 100"
                    accent={riskColor.bg}
                    borderColor={`${riskColor.border} hover:brightness-110`}
                    icon={ShieldAlert}
                    barPercent={summary.averageOrgRisk}
                />
            </div>

            {/* ── CHARTS ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Radial */}
                <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-6">
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">Posture Score</div>
                    <div className="h-48 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" barSize={12} data={radialData} startAngle={180} endAngle={0}>
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar background={{ fill: "rgba(255,255,255,0.04)" }} dataKey="value" cornerRadius={6} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className={`text-3xl font-bold font-mono ${riskColor.text}`}>{summary.averageOrgRisk}</span>
                            <span className="block text-[10px] text-white/30 uppercase tracking-widest mt-1 font-mono">Risk Score</span>
                        </div>
                    </div>
                    <div className={`mt-2 text-center text-xs font-mono font-bold ${riskColor.text}`}>
                        {summary.averageOrgRisk > 70 ? "⚠ CRITICAL — Review Required" : summary.averageOrgRisk > 40 ? "△ MODERATE — Monitor Closely" : "✓ SECURED — Low Exposure"}
                    </div>
                </div>

                {/* Line chart */}
                <div className="md:col-span-2 bg-[#0d0d14] border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Threat Exposure Trend</div>
                        {trendChange !== null && (
                            <div className={`flex items-center gap-1 text-xs font-mono font-bold ${trendChange < 0 ? "text-[#00e5a0]" : trendChange > 0 ? "text-red-400" : "text-white/30"}`}>
                                {trendChange < 0 ? "↓" : trendChange > 0 ? "↑" : "→"} {Math.abs(trendChange)} pts
                            </div>
                        )}
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono, monospace" />
                                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono, monospace" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0d0d14", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                                    itemStyle={{ color: "#00e5a0" }}
                                />
                                <Line type="monotone" dataKey="risk" stroke="#00e5a0" strokeWidth={2} dot={{ fill: "#090910", stroke: "#00e5a0", strokeWidth: 2, r: 3 }} activeDot={{ r: 5, fill: "#00e5a0" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── PROJECTS GRID ────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-bold text-white tracking-tight">Architecture Blueprints</h2>
                        <p className="text-xs text-white/30 mt-0.5 font-mono">{projects.length} environment{projects.length !== 1 ? "s" : ""} mapped</p>
                    </div>
                    <Link href="/dashboard/projects/new" className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors">
                        View all <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="border border-dashed border-white/[0.08] bg-[#0d0d14] rounded-xl py-20 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-[#00e5a0]/5 border border-[#00e5a0]/15 flex items-center justify-center mb-5">
                            <Search className="h-6 w-6 text-[#00e5a0]/50" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-2">No Architectures Yet</h3>
                        <p className="text-sm text-white/30 max-w-sm mx-auto mb-6">Map your first infrastructure environment to begin continuous threat intelligence.</p>
                        <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00e5a0] text-[#090910] rounded-lg text-sm font-bold hover:bg-[#00c87a] transition-all">
                            <Plus className="h-4 w-4" /> Create First Blueprint
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {projects.map((project: any) => {
                            const isCrit = project.riskScore >= 70;
                            const isMod = project.riskScore >= 30 && project.riskScore < 70;
                            const color = isCrit
                                ? { text: "text-red-400", border: "border-red-500/15 hover:border-red-500/40", bar: "bg-red-500", badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "CRITICAL" }
                                : isMod
                                    ? { text: "text-amber-400", border: "border-amber-500/15 hover:border-amber-500/40", bar: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "MODERATE" }
                                    : { text: "text-[#00e5a0]", border: "border-[#00e5a0]/15 hover:border-[#00e5a0]/40", bar: "bg-[#00e5a0]", badge: "bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20", label: "SECURED" };

                            return (
                                <Link key={project._id} href={`/dashboard/architect?id=${project._id}`} className="block group">
                                    <div className={`h-full bg-[#0d0d14] border ${color.border} rounded-xl p-6 transition-all duration-300 hover:bg-[#111118] relative overflow-hidden`}>
                                        {/* Left accent */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${color.bar} opacity-60`} />

                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`inline-flex items-center text-[9px] font-mono font-bold px-2 py-1 rounded border ${color.badge} uppercase tracking-widest`}>
                                                {color.label}
                                            </span>
                                            <span className="text-[10px] font-mono text-white/25 flex items-center gap-1">
                                                <Clock className="h-2.5 w-2.5" />
                                                {project.lastScan ? new Date(project.lastScan).toLocaleDateString() : "Unscanned"}
                                            </span>
                                        </div>

                                        <h3 className={`text-base font-bold text-white mb-2 group-hover:${color.text} transition-colors line-clamp-1`}>{project.name}</h3>
                                        <p className="text-xs text-white/30 mb-5 line-clamp-2 leading-relaxed">
                                            {project.description || "Enterprise architecture blueprint awaiting threat analysis."}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest block mb-1">Risk Score</span>
                                                <span className={`text-lg font-bold font-mono ${color.text}`}>{project.riskScore}<span className="text-xs text-white/20">/100</span></span>
                                            </div>
                                            <div className="w-1/2">
                                                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                                                    <div className={`h-full ${color.bar} transition-all duration-1000`} style={{ width: `${project.riskScore}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`mt-4 flex items-center justify-end gap-1 text-[10px] font-mono ${color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                            Open Canvas <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
