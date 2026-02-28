"use client";

import { useState, useEffect } from "react";
import { Radar, Skull, Target, AlertTriangle, ShieldAlert, Activity, GitCommit, FileWarning, ShieldCheck } from "lucide-react";

export default function ThreatIntelligencePage() {
    // Generate a list of realistic looking mock CVEs
    const [cves, setCves] = useState([
        { id: "CVE-2026-10452", severity: "CRITICAL", score: 9.8, type: "RCE", component: "Kubernetes API", status: "ACTIVE EXPLOIT" },
        { id: "CVE-2026-11899", severity: "HIGH", score: 8.4, type: "Privilege Escalation", component: "AWS IAM", status: "PATCHED" },
        { id: "CVE-2026-09211", severity: "CRITICAL", score: 9.1, type: "SQL Injection", component: "PostgreSQL", status: "ZERO-DAY" },
        { id: "CVE-2026-12001", severity: "MEDIUM", score: 5.6, type: "Information Disclosure", component: "Nginx", status: "MONITORING" },
        { id: "CVE-2026-08443", severity: "HIGH", score: 7.9, type: "Bypass", component: "AWS WAF", status: "ACTIVE EXPLOIT" },
        { id: "CVE-2025-41220", severity: "HIGH", score: 8.1, type: "Deserialization", component: "NodeJS", status: "PATCHED" },
        { id: "CVE-2025-33981", severity: "CRITICAL", score: 10.0, type: "Auth Bypass", component: "OAuth2 Provider", status: "ZERO-DAY" },
    ]);

    const [mitreTactics] = useState([
        { id: "TA0001", name: "Initial Access", activeThreats: 14, trend: "+2%" },
        { id: "TA0002", name: "Execution", activeThreats: 8, trend: "-1%" },
        { id: "TA0003", name: "Persistence", activeThreats: 22, trend: "+5%" },
        { id: "TA0004", name: "Privilege Escalation", activeThreats: 19, trend: "+12%" },
        { id: "TA0005", name: "Defense Evasion", activeThreats: 31, trend: "+18%" },
        { id: "TA0006", name: "Credential Access", activeThreats: 45, trend: "+8%" },
    ]);

    // Animate a ticker randomly generating "live intercepts"
    const [liveIntercepts, setLiveIntercepts] = useState<string[]>([]);

    useEffect(() => {
        const ips = ["192.168.1.44", "10.0.5.122", "172.16.2.9", "45.33.12.98", "104.22.5.1"];
        const actions = ["Port Scan Detected", "Failed Auth Brute Force", "WAF Ruleset Triggered", "Suspicious Lambda Invocation", "Unusual S3 Bucket Access"];
        const targets = ["API Gateway", "Auth Service", "Billing Database", "VPC Endpoint", "Customer Portal"];

        const generateIntercept = () => {
            const ip = ips[Math.floor(Math.random() * ips.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const target = targets[Math.floor(Math.random() * targets.length)];
            return `[${new Date().toISOString().split('T')[1].slice(0, 8)}] [IP: ${ip}] ${action} -> ${target}`;
        };

        // Seed initial
        setLiveIntercepts(Array(10).fill("").map(generateIntercept));

        const interval = setInterval(() => {
            setLiveIntercepts(prev => [generateIntercept(), ...prev].slice(0, 10));
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-full bg-[#060606] p-4 md:p-8 font-mono">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6 flex items-end justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center bg-black border border-[#FF3131]/30 shadow-[0_0_15px_rgba(255,49,49,0.1)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#FF3131]/10 group-hover:bg-[#FF3131]/20 transition-colors" />
                        <Radar className="h-5 w-5 text-[#FF3131] relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white uppercase tracking-widest font-mono">Threat Intelligence Feed</h1>
                        <p className="text-[10px] text-[#FF3131]/60 uppercase tracking-widest font-mono mt-1">Live CVEs & Zero-Day Tracking</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FF3131]/10 border border-[#FF3131]/20 rounded-sm">
                    <div className="w-2 h-2 rounded-full bg-[#FF3131] animate-pulse"></div>
                    <span className="text-[10px] text-[#FF3131] font-bold tracking-widest uppercase">ZION ENGINE: REAL-TIME LINK</span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: CVEs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Live Ticker Terminal */}
                    <div className="bg-[#101014] border border-white/10 p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#00E5A0]/10 border-b border-l border-[#00E5A0]/30 text-[9px] text-[#00E5A0] tracking-widest flex items-center gap-1">
                            <Activity className="w-3 h-3" /> LIVE NETWORK INTERCEPTS
                        </div>
                        <h3 className="text-sm font-bold text-white/50 tracking-widest uppercase mb-4">Global Sensor Grid</h3>
                        <div className="font-mono text-[10px] space-y-1 h-[140px] flex flex-col justify-end overflow-hidden mask-image-bottom">
                            {[...liveIntercepts].reverse().map((intercept, i) => (
                                <div key={i} className={`text-white/40 ${i === 9 ? 'text-[#00E5A0] animate-pulse' : ''} transition-all duration-300 transform translate-y-0`}>
                                    {intercept}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CVE Database */}
                    <div className="bg-[#101014] border border-white/10 pb-2">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                <FileWarning className="w-4 h-4 text-[#FF3131]" />
                                Active Exploit Database
                            </h3>
                            <span className="text-[10px] px-2 py-1 bg-white/5 text-white/50 tracking-widest uppercase border border-white/10">
                                48,291 RECORDS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-black/40">
                                        <th className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">CVE ID</th>
                                        <th className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Severity</th>
                                        <th className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Score (CVSS)</th>
                                        <th className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Component / Type</th>
                                        <th className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Tracking Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {cves.map((cve) => (
                                        <tr key={cve.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-3 font-mono text-[11px] text-white/80 group-hover:text-white">{cve.id}</td>
                                            <td className="p-3">
                                                <span className={`text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold border ${cve.severity === 'CRITICAL' ? 'bg-[#FF3131]/10 text-[#FF3131] border-[#FF3131]/30' :
                                                    cve.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                                                        'bg-[#00E5A0]/10 text-[#00E5A0] border-[#00E5A0]/30'
                                                    }`}>
                                                    {cve.severity}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-[11px] text-white/60">{cve.score.toFixed(1)}</td>
                                            <td className="p-3">
                                                <div className="text-[11px] text-white/80">{cve.component}</div>
                                                <div className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{cve.type}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono">
                                                    {cve.status === 'ZERO-DAY' && <Skull className="w-3 h-3 text-[#FF3131]" />}
                                                    {cve.status === 'ACTIVE EXPLOIT' && <Target className="w-3 h-3 text-[#FF3131]" />}
                                                    {cve.status === 'MONITORING' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                                                    {cve.status === 'PATCHED' && <ShieldCheck className="w-3 h-3 text-[#00E5A0]" />}
                                                    <span className={
                                                        cve.status === 'ZERO-DAY' || cve.status === 'ACTIVE EXPLOIT' ? 'text-[#FF3131]' :
                                                            cve.status === 'MONITORING' ? 'text-amber-500' : 'text-[#00E5A0]'
                                                    }>{cve.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: MITRE ATT&CK */}
                <div className="space-y-6">
                    <div className="bg-[#101014] border border-white/10 p-4">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">MITRE ATT&CK Heatmap</h3>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/MITRE_Corporation_logo.svg/200px-MITRE_Corporation_logo.svg.png" className="h-4 opacity-50 grayscale invert" alt="MITRE" />
                        </div>

                        <div className="space-y-3">
                            {mitreTactics.map((tactic) => (
                                <div key={tactic.id} className="p-3 bg-black/50 border border-white/5 relative overflow-hidden group hover:border-[#FF3131]/30 transition-colors">
                                    {/* Heatmap background bar */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#FF3131]/10 pointer-events-none transition-all duration-1000"
                                        style={{ width: `${Math.min(100, tactic.activeThreats * 3)}%` }}
                                    />
                                    <div className="relative z-10 flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase bg-white/5 px-1">{tactic.id}</span>
                                            <h4 className="text-xs font-bold text-white tracking-wider mt-1">{tactic.name}</h4>
                                        </div>
                                        <div className={`text-[10px] font-mono tracking-widest ${tactic.trend.startsWith('+') ? 'text-[#FF3131]' : 'text-[#00E5A0]'}`}>
                                            {tactic.trend}
                                        </div>
                                    </div>
                                    <div className="relative z-10 flex items-end gap-1">
                                        <span className="text-lg font-bold text-white leading-none">{tactic.activeThreats}</span>
                                        <span className="text-[9px] text-white/40 uppercase tracking-widest pb-0.5">Active Vectors</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <button className="w-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors py-2 text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2">
                                <GitCommit className="w-3 h-3" /> Execute Deep Analysis
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
