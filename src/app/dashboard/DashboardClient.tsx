"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ShieldAlert, Activity, CheckCircle, Clock, Sparkles, Server, Search, ArrowRight, TrendingDown } from "lucide-react";
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



export default function DashboardClient({ orgId }: { orgId: string }) {
    // Query actual data from Convex
    const summary = useQuery(api.architecture.getOrgRiskSummary, { orgId });
    const projects = useQuery(api.architecture.getOrgProjects, { orgId });

    if (summary === undefined || projects === undefined) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Activity className="animate-spin h-8 w-8 text-cyan-500" />
                <p className="text-white/50 animate-pulse font-mono tracking-widest text-sm uppercase">Synchronizing Digital Galaxy...</p>
            </div>
        );
    }

    const radialData = [{ name: 'Risk', value: summary.averageOrgRisk, fill: summary.averageOrgRisk > 70 ? '#ef4444' : summary.averageOrgRisk > 40 ? '#f59e0b' : '#06b6d4' }];

    // Generate dynamic trend chart from real project data (most recent 6)
    const trendData = (() => {
        if (!projects || projects.length === 0) return [
            { name: 'No data', risk: 0 }
        ];
        const sorted = [...projects].sort((a: any, b: any) => (a._creationTime ?? 0) - (b._creationTime ?? 0));
        const last6 = sorted.slice(-6);
        return last6.map((p: any, i: number) => ({
            name: `Proj ${i + 1}`,
            risk: p.riskScore ?? 0
        }));
    })();

    // Trend: compare latest vs earliest project risk
    const trendChange = (() => {
        if (trendData.length < 2) return null;
        const diff = trendData[trendData.length - 1].risk - trendData[0].risk;
        return diff;
    })();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* ZIN AI PROMPT BAR */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                    <Sparkles className="h-6 w-6 text-cyan-400 mr-4 animate-pulse" />
                    <input
                        type="text"
                        placeholder="I am Sentinel AI, tell me about our cyber risks across the digital galaxy..."
                        className="bg-transparent border-none outline-none w-full text-white/90 placeholder:text-white/40 font-medium text-lg"
                    />
                    <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors ml-4 border border-white/5">
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* TOP METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-black/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Server className="h-24 w-24 text-cyan-500" />
                    </div>
                    <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center">
                        Total Assets Mapped
                    </div>
                    <div className="text-4xl font-light text-white tracking-tight">{summary.totalProjects * 8} <span className="text-sm text-white/30 ml-1">nodes</span></div>
                </div>

                <div className="bg-black/50 backdrop-blur-md border border-red-500/20 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition-colors duration-500 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldAlert className="h-24 w-24 text-red-500" />
                    </div>
                    <div className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center">
                        Exposed Attack Vectors
                    </div>
                    <div className="text-4xl font-light text-white tracking-tight">{summary.highRiskCount} <span className="text-sm text-red-500/50 ml-1">critical</span></div>
                </div>

                <div className="bg-black/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-colors duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center">
                        Protected Resources
                    </div>
                    <div className="text-4xl font-light text-white tracking-tight">{summary.lowRiskCount} <span className="text-sm text-green-500/50 ml-1">secured</span></div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 backdrop-blur-md border border-cyan-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center">
                        Mean Organizational Risk
                    </div>
                    <div className="text-5xl font-bold text-white tracking-tighter drop-shadow-lg">
                        {summary.averageOrgRisk}<span className="text-xl text-cyan-400/50 ml-1 font-light">/100</span>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium">
                        {trendChange === null ? (
                            <span className="text-white/40">No trend data yet</span>
                        ) : trendChange < 0 ? (
                            <><TrendingDown className="h-4 w-4 mr-1 text-emerald-400" /><span className="text-emerald-300">{Math.abs(trendChange)} pts improvement across projects</span></>
                        ) : trendChange > 0 ? (
                            <><TrendingDown className="h-4 w-4 mr-1 text-red-400 rotate-180" /><span className="text-red-300">{trendChange} pts increase — review required</span></>
                        ) : (
                            <span className="text-white/40">Risk score stable across projects</span>
                        )}
                    </div>
                </div>
            </div>

            {/* DATA VISUALIZATION ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Radial Risk Score */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest w-full text-left mb-4">Posture Quantification</h3>
                    <div className="h-48 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="100%"
                                barSize={15}
                                data={radialData}
                                startAngle={180}
                                endAngle={0}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar
                                    background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    dataKey="value"
                                    cornerRadius={10}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-4xl font-bold text-white">{summary.averageOrgRisk}</span>
                            <span className="block text-xs text-white/40 uppercase tracking-widest mt-1">Score</span>
                        </div>
                    </div>
                </div>

                {/* Risk Trend Chart */}
                <div className="md:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-6">Threat Exposure Horizon</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#06b6d4' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="risk"
                                    stroke="#06b6d4"
                                    strokeWidth={3}
                                    dot={{ fill: '#000', stroke: '#06b6d4', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#06b6d4' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ARCHITECTURE MODELS GRID */}
            <div className="pt-6 border-t border-white/10 mt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-light tracking-tight text-white mb-1">Architecture Grids</h2>
                        <p className="text-sm text-white/40">Select a mapped environment to analyze its attack surface.</p>
                    </div>
                    <Link href="/dashboard/projects/new" className="bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all text-cyan-400 px-6 py-2.5 rounded-full text-sm font-semibold flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Map New Environment
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-24 bg-black/40 border border-white/10 rounded-2xl border-dashed">
                        <div className="inline-flex h-16 w-16 rounded-full bg-cyan-500/10 items-center justify-center mb-6 border border-cyan-500/20">
                            <Search className="h-8 w-8 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">The Galaxy is Empty</h3>
                        <p className="text-white/50 max-w-md mx-auto mb-8">Begin modeling your infrastructure to unlock AI-driven threat intelligence and compliance mapping.</p>
                        <Link href="/dashboard/projects/new" className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            Initiate Mapping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projects.map((project: any) => {

                            const isCritical = project.riskScore >= 70;
                            const isModerate = project.riskScore >= 30 && project.riskScore < 70;

                            const colorStyles = isCritical
                                ? { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", fill: "bg-red-500", groupHoverBorder: "group-hover:border-red-500/50" }
                                : isModerate
                                    ? { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", fill: "bg-yellow-500", groupHoverBorder: "group-hover:border-yellow-500/50" }
                                    : { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", fill: "bg-cyan-500", groupHoverBorder: "group-hover:border-cyan-500/50" };

                            return (
                                <Link key={project._id} href={`/dashboard/architect?id=${project._id}`} className="block group">
                                    <div className={`h-full bg-black/60 backdrop-blur-sm border border-white/10 ${colorStyles.groupHoverBorder} rounded-2xl p-6 transition-all duration-500 hover:bg-white/[0.03] cursor-pointer relative overflow-hidden shadow-xl`}>

                                        {/* Subtle Glow Background on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-700 pointer-events-none"></div>

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Status</span>
                                                <div className={`inline-flex h-8 px-3 rounded-full items-center justify-center font-bold text-xs ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border} whitespace-nowrap`}>
                                                    {isCritical ? 'CRITICAL EXPOSURE' : isModerate ? 'MODERATE RISK' : 'SECURED'}
                                                </div>
                                            </div>

                                            <span className="text-xs font-medium text-white/30 flex items-center bg-white/5 px-2 py-1 rounded-md">
                                                <Clock className="h-3 w-3 mr-1.5 opacity-50" />
                                                {project.lastScan ? new Date(project.lastScan).toLocaleDateString() : 'Unscanned'}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-light tracking-tight text-white mb-2 relative z-10 group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                                        <p className="text-sm text-white/40 mb-8 line-clamp-2 relative z-10 leading-relaxed font-light">
                                            {project.description || "Enterprise architecture blueprint awaiting continuous posture analysis integration."}
                                        </p>

                                        <div className="flex items-end justify-between relative z-10">
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-widest text-white/30 block mb-1">Quantified Risk</span>
                                                <span className={`${colorStyles.text} font-medium text-lg`}>{project.riskScore}</span>
                                            </div>
                                            <div className="w-2/3">
                                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full ${colorStyles.fill} transition-all duration-1000`} style={{ width: `${project.riskScore}%` }}></div>
                                                </div>
                                            </div>
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
