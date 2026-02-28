"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ShieldAlert, Activity, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

// Using a generic inline type to bypass the implicit any error without needing to import full Convex Doc types
export default function DashboardClient({ orgId }: { orgId: string }) {
    // Query actual data from Convex
    const summary = useQuery(api.architecture.getOrgRiskSummary, {
        orgId
    });

    const projects = useQuery(api.architecture.getOrgProjects, {
        orgId
    });

    if (summary === undefined || projects === undefined) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Activity className="animate-spin h-8 w-8 text-purple-500" />
                <p className="text-white/50 animate-pulse">Synchronizing organization state...</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                    <div className="text-white/50 text-sm font-medium mb-1 flex items-center">
                        Total Projects
                    </div>
                    <div className="text-3xl font-bold">{summary.totalProjects}</div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none"></div>
                    <div className="text-red-400 text-sm font-medium mb-1 relative flex items-center">
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        High Risk Systems
                    </div>
                    <div className="text-3xl font-bold text-red-50 relative">{summary.highRiskCount}</div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                    <div className="text-green-400 text-sm font-medium mb-1 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Passed Audit
                    </div>
                    <div className="text-3xl font-bold text-green-50">{summary.lowRiskCount}</div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none"></div>
                    <div className="text-purple-400 text-sm font-medium mb-1 relative flex items-center">
                        Avg Organization Risk
                    </div>
                    <div className="text-3xl font-bold text-purple-50 relative">
                        {summary.averageOrgRisk}<span className="text-lg text-white/30 ml-1">/100</span>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Architecture Models</h2>
                    <Link href="/dashboard/projects/new" className="bg-purple-600 hover:bg-purple-500 transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium">
                        New Architecture
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl border-dashed">
                        <div className="inline-flex h-12 w-12 rounded-full bg-purple-500/20 items-center justify-center mb-4">
                            <ShieldAlert className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Architectures Found</h3>
                        <p className="text-white/50 max-w-sm mx-auto mb-6">Begin modeling your infrastructure to calculate risk profiles and compliance mapping.</p>
                        <Link href="/dashboard/projects/new" className="bg-white text-black px-6 py-2.5 rounded-lg font-medium hover:bg-white/90 transition-colors">
                            Start Modeling
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projects.map((project: any) => {

                            const isCritical = project.riskScore >= 70;
                            const isModerate = project.riskScore >= 30 && project.riskScore < 70;

                            const colorTheme = isCritical
                                ? "red"
                                : isModerate
                                    ? "yellow"
                                    : "green";

                            return (
                                <Link key={project._id} href={`/dashboard/architect?id=${project._id}`} className="block group">
                                    <div className="h-full bg-black border border-white/10 hover:border-purple-500/50 rounded-xl p-6 transition-all hover:bg-white/[0.02] cursor-pointer relative overflow-hidden">

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm bg-${colorTheme}-500/20 text-${colorTheme}-400 border border-${colorTheme}-500/30`}>
                                                {isCritical ? 'CRIT' : isModerate ? 'MOD' : 'LOW'}
                                            </div>
                                            <span className="text-xs font-medium text-white/40 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {project.lastScan ? new Date(project.lastScan).toLocaleDateString() : 'Never Scanned'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold mb-1 relative z-10">{project.name}</h3>
                                        <p className="text-sm text-white/50 mb-6 line-clamp-2 relative z-10">
                                            {project.description || "Enterprise architecture blueprint awaiting manual compliance review."}
                                        </p>

                                        <div className="flex items-center justify-between text-sm relative z-10">
                                            <span className={`text-${colorTheme}-400 font-medium`}>Risk Score: {project.riskScore}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden relative z-10">
                                            <div className={`h-full bg-${colorTheme}-500 transition-all duration-1000`} style={{ width: `${project.riskScore}%` }}></div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
