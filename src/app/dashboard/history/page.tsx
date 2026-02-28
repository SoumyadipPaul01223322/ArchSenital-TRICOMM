"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { History, ShieldAlert, CheckCircle2, Clock, Calendar, DownloadCloud, Activity } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SimulationHistoryPage() {
    const { orgId } = useAuth();

    // Fetch logs from Convex
    const simulationLogs = useQuery(api.simulations.getSimulationHistory,
        orgId ? { orgId } : "skip"
    );

    const exportCsv = () => {
        if (!simulationLogs) return;
        const headers = ["Date", "Architecture", "Status", "Initial Score", "Final Score", "Findings", "Remediations", "Duration (s)"];
        const rows = simulationLogs.map((log: any) => [
            new Date(log.createdAt).toLocaleString(),
            log.architectureName,
            log.status,
            log.initialRiskScore,
            log.finalRiskScore,
            log.findingCount,
            log.remediationsApplied,
            (log.runDurationMs / 1000).toFixed(1)
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any[]) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ArchSentinel_Attack_Logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPdf = () => {
        if (!simulationLogs || simulationLogs.length === 0) return;
        const doc = new jsPDF();

        // ----------------------------------------
        // PAGE 1: EXECUTIVE SUMMARY & TRENDS
        // ----------------------------------------
        doc.setFillColor(10, 10, 10);
        doc.rect(0, 0, 210, 297, 'F');

        // Header Title
        doc.setTextColor(0, 229, 160);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("ARCHSENTINEL SECURE", 15, 25);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text("Simulation History & Threat Ledger", 15, 33);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 42);
        doc.text(`Organization ID: ${orgId}`, 15, 47);
        doc.text(`Total Simulations Executed: ${simulationLogs.length}`, 15, 52);

        // Calculate Aggregate Stats
        const avgInitialRisk = Math.round(simulationLogs.reduce((acc: any, log: any) => acc + log.initialRiskScore, 0) / simulationLogs.length);
        const avgFinalRisk = Math.round(simulationLogs.reduce((acc: any, log: any) => acc + log.finalRiskScore, 0) / simulationLogs.length);
        const totalFindings = simulationLogs.reduce((acc: any, log: any) => acc + log.findingCount, 0);
        const failedSims = simulationLogs.filter((l: any) => l.status === 'Failed').length;

        // Executive Summary Module
        doc.setFillColor(20, 20, 24);
        doc.setDrawColor(40, 40, 50);
        doc.roundedRect(15, 65, 180, 55, 3, 3, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 229, 160);
        doc.text("EXECUTIVE THREAT POSTURE SUMMARY", 20, 75);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(220, 220, 220);
        const summaryText = `Over the tracked period, ArchSentinel Zin AI has executed ${simulationLogs.length} architectural threat models. The organization maintains an average pre-simulation baseline risk score of ${avgInitialRisk}/100, which has historically been mitigated down to a post-remediation average of ${avgFinalRisk}/100. The AI engine has uncovered a total of ${totalFindings} architectural vulnerabilities. ${failedSims > 0 ? `Warning: ${failedSims} simulations encountered failures or unexpected interruptions.` : 'All simulations ran successfully without interruption.'}`;

        const splitSummary = doc.splitTextToSize(summaryText, 170);
        doc.text(splitSummary, 20, 85);

        // Key Metrics Module
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("GLOBAL KEY METRICS", 15, 135);

        // Metric 1
        doc.setFillColor(20, 20, 24);
        doc.roundedRect(15, 142, 55, 25, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("AVG RISK DELTA", 20, 150);
        doc.setFontSize(18);
        doc.setTextColor(0, 229, 160);
        doc.text(`-${avgInitialRisk - avgFinalRisk} PTS`, 20, 160);

        // Metric 2
        doc.roundedRect(75, 142, 55, 25, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("TOTAL VULNERABILITIES", 80, 150);
        doc.setFontSize(18);
        doc.setTextColor(239, 68, 68); // Red
        doc.text(`${totalFindings} FINDINGS`, 80, 160);

        // Metric 3
        doc.roundedRect(135, 142, 60, 25, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("AI ENGINE RUNTIME", 140, 150);
        doc.setFontSize(18);
        doc.setTextColor(59, 130, 246); // Blue
        const totalDuration = (simulationLogs.reduce((acc: any, log: any) => acc + log.runDurationMs, 0) / 1000).toFixed(1);
        doc.text(`${totalDuration}s COMPUTE`, 140, 160);

        // ----------------------------------------
        // PAGE 2: COMPREHENSIVE LEDGER TABLE
        // ----------------------------------------
        doc.addPage();
        doc.setFillColor(10, 10, 10);
        doc.rect(0, 0, 210, 297, 'F');

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 229, 160);
        doc.text("DETAILED SIMULATION LEDGER", 15, 25);

        const tableBody = simulationLogs.map((log: any) => [
            new Date(log.createdAt).toLocaleDateString() + ' ' + new Date(log.createdAt).toLocaleTimeString(),
            log.architectureName,
            log.status,
            `${log.initialRiskScore} → ${log.finalRiskScore}`,
            log.findingCount.toString(),
            `${(log.runDurationMs / 1000).toFixed(1)}s`
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Timestamp', 'Architecture Target', 'Status', 'Risk Shift', 'Findings', 'Run Time']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [0, 229, 160], textColor: [0, 0, 0], fontStyle: 'bold' },
            styles: { fillColor: [20, 20, 24], textColor: [200, 200, 200], fontSize: 9, cellPadding: 4, lineColor: [40, 40, 50] },
            alternateRowStyles: { fillColor: [15, 15, 18] },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 50 },
                3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
                4: { halign: 'center' },
                5: { halign: 'right' }
            },
            margin: { top: 20, bottom: 25 },
            didParseCell: function (data) {
                // Color code the 'Status' and 'Findings' columns
                if (data.section === 'body') {
                    if (data.column.index === 2) { // Status
                        const val = data.cell.raw as string;
                        if (val === 'Completed') data.cell.styles.textColor = [0, 229, 160];
                        if (val === 'Failed') data.cell.styles.textColor = [239, 68, 68];
                        if (val === 'Interrupted') data.cell.styles.textColor = [234, 179, 8];
                    }
                    if (data.column.index === 4) { // Findings
                        const val = parseInt(data.cell.raw as string);
                        if (val > 0) {
                            data.cell.styles.textColor = [239, 68, 68]; // Red for vulnerabilities
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            },
            didDrawPage: function (data: any) {
                // Footer pagination on every table page
                const str = "Page " + (doc.internal as any).getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(str, 195, 290, { align: 'right' });
                doc.text("ArchSentinel Cryptographic Ledger - CONFIDENTIAL", 15, 290);
            }
        });

        doc.save(`ArchSentinel_Enterprise_Audit_Log_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tighter flex items-center gap-3 text-white">
                        <History className="w-8 h-8 text-[#00E5A0]" />
                        SIMULATION HISTORY
                    </h1>
                    <p className="text-white/50 text-sm mt-2 font-mono">
                        Cryptographic ledger of all executed AI attack simulations.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportCsv} disabled={!simulationLogs || simulationLogs.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <DownloadCloud className="w-4 h-4" /> CSV
                    </button>
                    <button onClick={exportPdf} disabled={!simulationLogs || simulationLogs.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00E5A0]/10 hover:bg-[#00E5A0]/20 border border-[#00E5A0]/30 rounded-lg text-xs font-mono font-bold text-[#00E5A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <DownloadCloud className="w-4 h-4" /> PDF REPORT
                    </button>
                </div>
            </div>

            {/* Main Ledger Table */}
            <div className="bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden font-mono">
                {simulationLogs === undefined ? (
                    <div className="p-12 text-center text-white/40 flex flex-col items-center">
                        <Activity className="w-8 h-8 animate-pulse mb-3 text-[#00E5A0]/50" />
                        Decrypting ledger logs...
                    </div>
                ) : simulationLogs.length === 0 ? (
                    <div className="p-16 text-center text-white/40 flex flex-col items-center">
                        <ShieldAlert className="w-12 h-12 mb-4 text-white/20" />
                        <p className="text-lg text-white/80 mb-2">No Attack Logs Found</p>
                        <p className="text-sm max-w-md mx-auto mb-6">You haven't run any AI Threat Simulations yet. Build an architecture and click "Simulate Threat" to populate this ledger.</p>
                        <Link href="/dashboard/projects/new" className="px-6 py-2 bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/30 rounded-full hover:bg-[#00E5A0]/20 transition-colors text-xs font-bold uppercase tracking-widest">
                            New Architecture
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#111115] border-b border-white/10">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                                    <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Architecture Target</th>
                                    <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Risk Posture (Pre → Post)</th>
                                    <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Findings</th>
                                    <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Run Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {simulationLogs.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                                <Calendar className="w-3.5 h-3.5 text-white/30" />
                                                {new Date(log.createdAt).toLocaleDateString()}
                                                <span className="text-white/30 text-xs ml-1">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white/90 text-sm font-bold truncate max-w-[200px]">
                                                {log.architectureName}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {log.status === 'Completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] text-[10px] font-bold uppercase tracking-wider">
                                                    <CheckCircle2 className="w-3 h-3" /> SUCCESS
                                                </span>
                                            ) : log.status === 'Failed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                                                    <ShieldAlert className="w-3 h-3" /> FAILED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
                                                    <Activity className="w-3 h-3" /> INTERRUPTED
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                                                    {log.initialRiskScore}
                                                </div>
                                                <span className="text-white/20">→</span>
                                                <div className="flex items-center justify-center w-8 h-8 rounded bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] text-xs font-bold">
                                                    {log.finalRiskScore}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert className={`w-4 h-4 ${log.findingCount > 0 ? "text-red-400" : "text-white/20"}`} />
                                                <span className={`text-sm font-bold ${log.findingCount > 0 ? "text-white" : "text-white/30"}`}>
                                                    {log.findingCount} Vulnerabilities
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white/50 text-sm flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {(log.runDurationMs / 1000).toFixed(1)}s
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
