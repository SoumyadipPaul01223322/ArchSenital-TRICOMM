"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { ShieldCheck, Download, AlertTriangle, CheckCircle2, Activity, FileText, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";

// Static mock framework data
const FRAMEWORKS = [
    { id: 'soc2', name: 'SOC 2 Type II', score: 92, status: 'PASSING', trend: '+2%' },
    { id: 'iso', name: 'ISO 27001', score: 88, status: 'WARNING', trend: '-1%' },
    { id: 'hipaa', name: 'HIPAA', score: 100, status: 'PASSING', trend: '0%' },
    { id: 'pci', name: 'PCI-DSS v4', score: 74, status: 'FAILING', trend: '-5%' },
];

export default function CompliancePage() {
    const { orgId, userId } = useAuth();
    const activeOwnerId = orgId || userId;

    // Fetch all architectures for this org to calculate aggregated risk
    const architectures = useQuery(api.architectures.listArchitectures, activeOwnerId ? { ownerId: activeOwnerId } : "skip");

    const [isExporting, setIsExporting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate aggregated mock risks based on the number of nodes across all architectures
    const aggregatedRisks = architectures
        ? architectures.slice(0, 5).flatMap(arch => {
            const hasManyNodes = arch.nodes.length > 10;
            return [
                {
                    id: `${arch._id}-1`,
                    source: arch.name,
                    control: 'CC6.1 (Logical Access)',
                    framework: 'SOC 2',
                    severity: 'HIGH',
                    status: 'FAILED',
                    detail: hasManyNodes ? 'Multiple generic VPCs detected without isolation.' : 'Default admin roles unreplaced.'
                },
                {
                    id: `${arch._id}-2`,
                    source: arch.name,
                    control: 'Req 3.4 (Data Protection)',
                    framework: 'PCI-DSS',
                    severity: hasManyNodes ? 'CRITICAL' : 'MEDIUM',
                    status: 'FAILED',
                    detail: 'EBS volume encryption disabled.'
                }
            ];
        })
        : [];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();

            // Cover Page
            doc.setFillColor(6, 6, 6);
            doc.rect(0, 0, 210, 297, 'F');

            doc.setTextColor(0, 229, 160);
            doc.setFontSize(24);
            doc.setFont('courier', 'bold');
            doc.text("ARCHSENTINEL", 20, 40);

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text("EXECUTIVE COMPLIANCE AUDIT", 20, 55);

            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`GENERATED: ${new Date().toISOString()}`, 20, 70);
            doc.text(`ENTITY ID: ${activeOwnerId || 'UNKNOWN'}`, 20, 80);

            // Framework Scores
            doc.setTextColor(0, 229, 160);
            doc.setFontSize(14);
            doc.text("FRAMEWORK POSTURE SCORES", 20, 110);

            let y = 130;
            FRAMEWORKS.forEach(fw => {
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(11);
                doc.text(`${fw.name}:`, 20, y);

                if (fw.status === 'FAILING') doc.setTextColor(255, 49, 49);
                else doc.setTextColor(0, 229, 160);

                doc.text(`${fw.score}% [${fw.status}]`, 80, y);
                y += 10;
            });

            // Append Risk Table
            if (aggregatedRisks.length > 0) {
                doc.addPage();
                doc.setFillColor(6, 6, 6);
                doc.rect(0, 0, 210, 297, 'F');

                doc.setTextColor(0, 229, 160);
                doc.setFontSize(14);
                doc.text("AGGREGATED CONTROL FAILURES", 20, 20);

                y = 40;
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text("SOURCE", 20, y);
                doc.text("FRAMEWORK", 80, y);
                doc.text("SEVERITY", 130, y);

                y += 10;
                aggregatedRisks.forEach((risk) => {
                    if (y > 270) {
                        doc.addPage();
                        doc.setFillColor(6, 6, 6);
                        doc.rect(0, 0, 210, 297, 'F');
                        y = 20;
                    }
                    doc.setTextColor(255, 255, 255);
                    let safeSource = doc.splitTextToSize(risk.source, 50);
                    doc.text(safeSource, 20, y);
                    doc.text(`${risk.framework} - ${risk.control}`, 80, y);

                    if (risk.severity === 'CRITICAL' || risk.severity === 'HIGH') doc.setTextColor(255, 49, 49);
                    else doc.setTextColor(255, 170, 0);

                    doc.text(risk.severity, 130, y);

                    // Increment y based on lines used by source name wrap
                    y += (safeSource.length * 5) + 5;
                });
            }

            doc.save(`ArchSentinel_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Report generation failed.");
        } finally {
            setIsExporting(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-full bg-[#060606] p-4 md:p-8 font-mono">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center bg-black border border-[#3b82f6]/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#3b82f6]/10 group-hover:bg-[#3b82f6]/20 transition-colors" />
                        <ShieldCheck className="h-5 w-5 text-[#3b82f6] relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white uppercase tracking-widest">Compliance & Audit</h1>
                        <p className="text-[10px] text-[#3b82f6]/60 uppercase tracking-widest mt-1">Cross-Framework Regulatory Posture</p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-[#00E5A0]/10 border border-[#00E5A0]/40 text-[#00E5A0] hover:bg-[#00E5A0] hover:text-black font-bold text-[10px] uppercase tracking-widest px-6 py-2.5 transition-all disabled:opacity-50"
                >
                    {isExporting ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Generate Audit PDF
                </button>
            </div>

            {architectures === undefined ? (
                // Loading State
                <div className="flex flex-col items-center justify-center py-32 border border-white/5 bg-[#101014]">
                    <Activity className="h-8 w-8 text-[#3b82f6] animate-pulse mb-4" />
                    <p className="text-[10px] text-[#3b82f6]/50 uppercase tracking-widest animate-pulse">Aggregating Compliance Logs...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Top Framework Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FRAMEWORKS.map((fw) => (
                            <div key={fw.id} className="bg-[#101014] border border-white/10 p-5 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none opacity-50
                                    ${fw.status === 'FAILING' ? 'group-hover:from-[#FF3131]/10' : 'group-hover:from-[#00E5A0]/10'}
                                    transition-colors`} />

                                <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                                    {fw.name}
                                </h3>

                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-start gap-1">
                                        <span className={`text-4xl font-bold leading-none ${fw.status === 'FAILING' ? 'text-[#FF3131]' : 'text-[#00E5A0]'}`}>
                                            {fw.score}
                                        </span>
                                        <span className="text-sm text-white/40 font-bold">%</span>
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-widest
                                        ${fw.status === 'FAILING' ? 'text-[#FF3131] border-[#FF3131]/30 bg-[#FF3131]/10' : ''}
                                        ${fw.status === 'WARNING' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : ''}
                                        ${fw.status === 'PASSING' ? 'text-[#00E5A0] border-[#00E5A0]/30 bg-[#00E5A0]/10' : ''}
                                    `}>
                                        {fw.status}
                                    </div>
                                </div>

                                <div className="h-1 w-full bg-black mt-4 relative overflow-hidden">
                                    <div
                                        className={`absolute top-0 left-0 h-full ${fw.status === 'FAILING' ? 'bg-[#FF3131]' : 'bg-[#00E5A0]'}`}
                                        style={{ width: `${fw.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grid Layout for Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Violations Table */}
                        <div className="lg:col-span-2 bg-[#101014] border border-white/10 flex flex-col">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-[#FF3131]" />
                                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Active Control Failures</h2>
                                </div>
                                <span className="text-[10px] text-white/40 uppercase tracking-widest">Aggregated from {architectures.length} active models</span>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-black/40">
                                            <th className="px-4 py-3 text-[10px] font-bold text-white/50 uppercase tracking-widest whitespace-nowrap">Source Arch</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-white/50 uppercase tracking-widest">Framework / Control</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-white/50 uppercase tracking-widest">Severity</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-white/50 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {aggregatedRisks.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-12 text-center text-white/30 text-xs uppercase tracking-widest">
                                                    No violations registered across architectures.
                                                </td>
                                            </tr>
                                        ) : (
                                            aggregatedRisks.map((risk) => (
                                                <tr key={risk.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-4 py-3 text-xs text-white/90 truncate max-w-[150px]">{risk.source}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-xs text-white/80">{risk.control}</div>
                                                        <div className="text-[9px] text-[#3b82f6]/70 mt-0.5 uppercase">{risk.framework}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-wider font-bold
                                                            ${risk.severity === 'CRITICAL' ? 'bg-[#FF3131]/10 border-[#FF3131]/30 text-[#FF3131]' : ''}
                                                            ${risk.severity === 'HIGH' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : ''}
                                                            ${risk.severity === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : ''}
                                                        `}>
                                                            {risk.severity}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest flex items-center justify-end gap-1 w-full transition-colors opacity-0 group-hover:opacity-100">
                                                            View Model <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Governance Logs */}
                        <div className="bg-[#101014] border border-white/10 flex flex-col">
                            <div className="p-4 border-b border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-white/40" />
                                    Audit Trail History
                                </h2>
                            </div>
                            <div className="p-4 space-y-4">
                                {[
                                    { time: '10 MIN AGO', event: 'HIPAA scan completed automatically', type: 'scan' },
                                    { time: '2 HRS AGO', event: 'Vault architectural baseline locked via API', type: 'system' },
                                    { time: '1 DAY AGO', event: 'Executive PDF Report generated', type: 'export' },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-px h-full bg-white/10 relative mt-2 ml-1">
                                            <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-none border border-white/30 bg-[#060606]" />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{log.time}</div>
                                            <div className="text-xs text-white/70">{log.event}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
