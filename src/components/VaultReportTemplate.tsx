import React, { forwardRef } from 'react';
import { Network, Box, ShieldCheck, AlertTriangle } from 'lucide-react';

interface VaultReportTemplateProps {
    arch: any;
}

export const VaultReportTemplate = forwardRef<HTMLDivElement, VaultReportTemplateProps>(({ arch }, ref) => {
    // Deterministic mock score based on node count
    const score = Math.max(0, 100 - (arch.nodes.length * 2) - (arch.edges.length));
    let status = "PASSING";
    if (score < 80) status = "WARNING";
    if (score < 60) status = "FAILING";

    const frameworks = [
        { name: 'SOC 2 Type II', score: Math.min(100, score + 12), status: score + 12 < 60 ? 'FAILING' : score + 12 < 80 ? 'WARNING' : 'PASSING' },
        { name: 'ISO 27001', score: Math.min(100, score + 5), status: score + 5 < 60 ? 'FAILING' : score + 5 < 80 ? 'WARNING' : 'PASSING' },
        { name: 'PCI-DSS v4', score: Math.max(0, score - 15), status: score - 15 < 60 ? 'FAILING' : score - 15 < 80 ? 'WARNING' : 'PASSING' },
    ];

    return (
        <div
            ref={ref}
            // Fixed A4 dimensions at 96 DPI: 794px x 1123px (We use a bit wider to ensure crispness, it scales down in jsPDF)
            className="w-[1000px] bg-[#060606] text-white font-mono p-12 overflow-hidden"
        >
            {/* Header Section */}
            <div className="border-b-2 border-white/20 pb-8 mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[#00E5A0] tracking-widest uppercase mb-2">ArchSentinel Vault</h1>
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-4">Architecture Detail & Audit</h2>

                    <div className="text-sm text-white/50 space-y-1">
                        <p>MODEL NAME: <span className="text-white">{arch.name}</span></p>
                        <p>MODEL ID: <span className="text-white">{arch._id}</span></p>
                        <p>REPORT DATE: <span className="text-white">{new Date().toISOString()}</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <ShieldCheck className="w-16 h-16 text-[#00E5A0] opacity-80 inline-block mb-4" />
                    <div className="text-xs text-white/40 tracking-[0.2em]">CLASSIFICATION: RESTRICTED</div>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-[#00E5A0] uppercase tracking-widest border-l-4 border-[#00E5A0] pl-3 mb-4">Topology Specifications</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#101014] border border-white/10 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Nodes</div>
                            <div className="text-4xl font-bold text-white">{arch.nodes.length}</div>
                        </div>
                        <Box className="w-12 h-12 text-white/10" />
                    </div>
                    <div className="bg-[#101014] border border-white/10 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Connections</div>
                            <div className="text-4xl font-bold text-white">{arch.edges.length}</div>
                        </div>
                        <Network className="w-12 h-12 text-white/10" />
                    </div>
                </div>
            </div>

            {/* Compliance Scores */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-[#00E5A0] uppercase tracking-widest border-l-4 border-[#00E5A0] pl-3 mb-4">Predictive Compliance Analysis</h3>
                <div className="grid grid-cols-3 gap-6">
                    {frameworks.map(fw => (
                        <div key={fw.name} className="bg-[#101014] border border-white/10 p-4">
                            <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">{fw.name}</h4>
                            <div className="flex justify-between items-end mb-4">
                                <span className={`text-3xl font-bold ${fw.status === 'FAILING' ? 'text-[#FF3131]' : fw.status === 'WARNING' ? 'text-amber-500' : 'text-[#00E5A0]'}`}>
                                    {fw.score}%
                                </span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 ${fw.status === 'FAILING' ? 'bg-[#FF3131]/10 text-[#FF3131] border border-[#FF3131]/30' :
                                    fw.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
                                        'bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/30'
                                    }`}>
                                    {fw.status}
                                </span>
                            </div>
                            <div className="w-full h-1 bg-black overflow-hidden mt-2">
                                <div
                                    className={`h-full ${fw.status === 'FAILING' ? 'bg-[#FF3131]' : fw.status === 'WARNING' ? 'bg-amber-500' : 'bg-[#00E5A0]'}`}
                                    style={{ width: `${fw.score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nodes Table */}
            <div>
                <h3 className="text-lg font-bold text-[#00E5A0] uppercase tracking-widest border-l-4 border-[#00E5A0] pl-3 mb-4">System Component Inventory</h3>
                <div className="border border-white/10 bg-[#101014]">
                    <table className="w-full text-left">
                        <thead className="bg-black/50 border-b border-white/10">
                            <tr>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest w-[40%]">Component ID</th>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest w-[20%]">Type</th>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest w-[40%]">Label/Configuration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 flex-col">
                            {arch.nodes.map((node: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                    <td className="p-4 text-xs text-white/80 font-mono overflow-hidden text-ellipsis">{node.id}</td>
                                    <td className="p-4">
                                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 uppercase text-[#00E5A0]">
                                            {node.type || 'default'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-white/60">
                                        {node.data?.label || 'Unnamed component'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer watermark */}
            <div className="mt-16 text-center text-white/10 font-bold uppercase tracking-[0.5em] text-sm">
                ArchSentinel Confidential
            </div>
        </div>
    );
});

VaultReportTemplate.displayName = "VaultReportTemplate";
