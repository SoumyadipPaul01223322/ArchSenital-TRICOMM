"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Database, Trash2, ExternalLink, Activity, Network, Box, FileText } from "lucide-react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { VaultReportTemplate } from "../../../components/VaultReportTemplate";

export default function VaultPage() {
    const { userId, orgId } = useAuth();
    const router = useRouter();
    const activeOwnerId = orgId || userId;
    const architectures = useQuery(api.architectures.listArchitectures, activeOwnerId ? { ownerId: activeOwnerId } : "skip");
    const deleteArchitecture = useMutation(api.architectures.deleteArchitecture);

    const [deletingId, setDeletingId] = useState<Id<"architectures"> | null>(null);

    const handleDelete = async (id: Id<"architectures">) => {
        setDeletingId(id);
        await deleteArchitecture({ id });
        setDeletingId(null);
    };

    const [exportingId, setExportingId] = useState<Id<"architectures"> | null>(null);
    const [reportArch, setReportArch] = useState<any | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleGenerateAudit = async (arch: any) => {
        setExportingId(arch._id);
        setReportArch(arch);

        try {
            // Give React a moment to render the off-screen template
            await new Promise(r => setTimeout(r, 600));

            if (!reportRef.current) throw new Error("Template ref not set");

            // Capture the DOM element as a high-res canvas using html-to-image
            // HTML-to-Image handles modern CSS (like Tailwind v4's oklab colors) much better than html2canvas
            const imgData = await htmlToImage.toPng(reportRef.current, {
                quality: 1.0,
                pixelRatio: 3, // High resolution
                backgroundColor: '#060606',
                cacheBust: true,
            });

            const width = reportRef.current.offsetWidth;
            const height = reportRef.current.offsetHeight;

            const pdfWidthMm = 210; // A4 width in mm
            const pdfHeightMm = 297; // A4 height in mm

            // Calculate proportional height of the full webpage in mm
            const totalHeightMm = (height * pdfWidthMm) / width;

            // Initialize standard A4 PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate how many A4 pages we need to cover the entire height
            const numPages = Math.ceil(totalHeightMm / pdfHeightMm);

            for (let i = 0; i < numPages; i++) {
                if (i > 0) {
                    pdf.addPage();
                }

                // Shift the image UP by the exact height of the pages already printed
                // This essentially uses the PDF page as a viewport clipping mask!
                const yOffset = -(pdfHeightMm * i);

                pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidthMm, totalHeightMm);
            }

            pdf.save(`ArchSentinel_Vault_${arch.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

        } catch (err) {
            console.error(err);
            alert("Failed to generate advanced PDF for this architecture.");
        } finally {
            setExportingId(null);
            setReportArch(null);
        }
    };

    const handleLoad = (id: Id<"architectures">) => {
        // Redirect to architect page with archId to load it as a blueprint
        router.push(`/dashboard/architect?archId=${id}`);
    };

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(timestamp));
    };

    return (
        <div className="min-h-full bg-[#060606] p-4 md:p-8 font-mono">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 flex items-center justify-center bg-black border border-[#00E5A0]/30 shadow-[0_0_15px_rgba(0,229,160,0.1)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#00E5A0]/10 group-hover:bg-[#00E5A0]/20 transition-colors" />
                        <Database className="h-5 w-5 text-[#00E5A0] relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white uppercase tracking-widest font-mono">Project Vault</h1>
                        <p className="text-[10px] text-[#00E5A0]/60 uppercase tracking-widest font-mono mt-1">Saved Architecture Baselines & Models</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {architectures === undefined ? (
                // Loading State
                <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-[#101014]">
                    <Activity className="h-8 w-8 text-[#00E5A0] animate-pulse mb-4" />
                    <p className="text-[10px] text-[#00E5A0]/50 uppercase tracking-widest animate-pulse">Accessing Secure Vault...</p>
                </div>
            ) : architectures.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-24 border border-white/10 bg-[#101014] border-dashed">
                    <Database className="h-12 w-12 text-white/10 mb-4" />
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2 font-mono">Vault Empty</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest text-center max-w-sm font-mono mb-6">
                        No saved architectures found. Head to the Architect to design and save your first infrastructure model.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/projects/new')}
                        className="bg-[#00E5A0]/10 border border-[#00E5A0]/30 text-[#00E5A0] font-bold text-[10px] uppercase tracking-widest px-6 py-2 hover:bg-[#00E5A0]/20 transition-colors"
                    >
                        INITIALIZE NEW ARCHITECTURE
                    </button>
                </div>
            ) : (
                // Grid/List of Architectures
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {architectures.map((arch) => (
                        <div
                            key={arch._id}
                            className="bg-[#101014] border border-white/10 p-5 relative overflow-hidden group hover:border-[#00E5A0]/40 transition-colors flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none group-hover:from-[#00E5A0]/10 transition-colors" />

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 truncate max-w-[200px]" title={arch.name}>
                                        {arch.name}
                                    </h3>
                                    <p className="text-[9px] text-[#00E5A0]/70 uppercase tracking-widest">
                                        UPDATED: <span className="text-white/50">{formatDate(arch.updatedAt)}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 mt-auto">
                                <div className="bg-black/50 border border-white/5 p-2 flex items-center justify-between">
                                    <span className="text-[9px] text-white/40 uppercase tracking-widest">Nodes</span>
                                    <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold">
                                        {arch.nodes.length} <Box className="w-3 h-3 text-white/30" />
                                    </div>
                                </div>
                                <div className="bg-black/50 border border-white/5 p-2 flex items-center justify-between">
                                    <span className="text-[9px] text-white/40 uppercase tracking-widest">Edges</span>
                                    <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold">
                                        {arch.edges.length} <Network className="w-3 h-3 text-white/30" />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 relative z-10 pt-4 border-t border-white/10 mt-auto">
                                <button
                                    onClick={() => handleLoad(arch._id)}
                                    className="flex-1 bg-[#00E5A0]/10 border border-[#00E5A0]/30 text-[#00E5A0] hover:bg-[#00E5A0] hover:text-black font-bold text-[10px] uppercase tracking-widest py-2 flex items-center justify-center transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    Load Model
                                </button>
                                <button
                                    onClick={() => handleGenerateAudit(arch)}
                                    disabled={exportingId === arch._id}
                                    className="px-3 py-2 bg-black border border-[#3b82f6]/30 text-[#3b82f6]/70 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Generate PDF Audit"
                                >
                                    {exportingId === arch._id ? (
                                        <Activity className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FileText className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(arch._id)}
                                    disabled={deletingId === arch._id}
                                    className="px-3 py-2 bg-black border border-[#FF3131]/30 text-[#FF3131]/70 hover:text-[#FF3131] hover:bg-[#FF3131]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Delete Architecture"
                                >
                                    {deletingId === arch._id ? (
                                        <Activity className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden Reports Template for html-to-image */}
            {reportArch && (
                <div style={{ position: 'fixed', top: 0, left: '-15000px', width: '1000px', zIndex: -9999 }}>
                    <VaultReportTemplate ref={reportRef} arch={reportArch} />
                </div>
            )}
        </div>
    );
}
