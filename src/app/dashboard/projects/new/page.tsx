"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ShieldAlert, ArrowRight, Layers, Server, Globe, Database, Boxes, Loader2 } from "lucide-react";

const TEMPLATES = [
    {
        id: "blank",
        label: "Blank Canvas",
        description: "Start from scratch with a clean canvas.",
        icon: Layers,
        color: "text-white/60",
        border: "border-white/10 hover:border-white/25",
        bg: "bg-white/[0.02]",
    },
    {
        id: "3tier",
        label: "3-Tier Web App",
        description: "Internet → WAF → Load Balancer → App Servers → DB.",
        icon: Globe,
        color: "text-cyan-400",
        border: "border-cyan-500/20 hover:border-cyan-500/50",
        bg: "bg-cyan-500/[0.04]",
    },
    {
        id: "microservices",
        label: "Microservices API",
        description: "API Gateway → Auth → Service Mesh → Databases.",
        icon: Boxes,
        color: "text-[#00e5a0]",
        border: "border-[#00e5a0]/20 hover:border-[#00e5a0]/50",
        bg: "bg-[#00e5a0]/[0.04]",
    },
    {
        id: "aws",
        label: "AWS Enterprise",
        description: "VPC → EC2 → RDS → CloudFront → WAF → IAM.",
        icon: Server,
        color: "text-orange-400",
        border: "border-orange-500/20 hover:border-orange-500/50",
        bg: "bg-orange-500/[0.04]",
    },
    {
        id: "database",
        label: "Data Platform",
        description: "Ingestion pipeline → Processing → Data Warehouse.",
        icon: Database,
        color: "text-blue-400",
        border: "border-blue-500/20 hover:border-blue-500/50",
        bg: "bg-blue-500/[0.04]",
    },
];

export default function NewProjectPage() {
    const router = useRouter();
    const { orgId } = useAuth();
    const createProject = useMutation(api.architecture.createProject);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("blank");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId || !name) return;
        setLoading(true);
        try {
            const projectId = await createProject({ orgId, name, description, templateId: selectedTemplate });
            router.push(`/dashboard/architect?id=${projectId}`);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-xs font-mono text-white/25 mb-4">
                    <span>Dashboard</span>
                    <span>/</span>
                    <span className="text-white/60">New Architecture</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#00e5a0]/8 border border-[#00e5a0]/20 flex items-center justify-center">
                        <ShieldAlert className="h-5 w-5 text-[#00e5a0]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Create Architecture Blueprint</h1>
                        <p className="text-sm text-white/30 mt-0.5">Define a new system boundary for continuous threat modeling.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Left: Template chooser */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-4">Start with a template</div>
                    {TEMPLATES.map((tpl) => {
                        const Icon = tpl.icon;
                        const active = selectedTemplate === tpl.id;
                        return (
                            <button
                                key={tpl.id}
                                type="button"
                                onClick={() => setSelectedTemplate(tpl.id)}
                                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${tpl.bg} ${tpl.border} ${active ? "ring-1 ring-offset-0 ring-white/20" : ""}`}
                            >
                                <div className={`h-8 w-8 rounded-lg ${tpl.bg} border ${tpl.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Icon className={`h-4 w-4 ${tpl.color}`} />
                                </div>
                                <div>
                                    <div className={`text-sm font-semibold ${active ? tpl.color : "text-white/70"} transition-colors`}>{tpl.label}</div>
                                    <div className="text-xs text-white/30 mt-0.5 leading-relaxed">{tpl.description}</div>
                                </div>
                                {active && (
                                    <div className={`ml-auto mt-0.5 h-4 w-4 rounded-full border-2 ${tpl.border} flex items-center justify-center flex-shrink-0`}>
                                        <div className={`h-1.5 w-1.5 rounded-full ${tpl.color.replace("text-", "bg-")}`} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="bg-[#0d0d14] border border-white/[0.08] rounded-xl p-8 space-y-7 h-full">
                        <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Blueprint Details</div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Architecture Name <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Production Payment API"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#090910] border border-white/[0.08] hover:border-white/15 focus:border-[#00e5a0]/40 focus:ring-1 focus:ring-[#00e5a0]/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all font-mono"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Description</label>
                            <textarea
                                placeholder="Briefly describe the components and data flows housed in this architecture..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="w-full bg-[#090910] border border-white/[0.08] hover:border-white/15 focus:border-[#00e5a0]/40 focus:ring-1 focus:ring-[#00e5a0]/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Selected template display */}
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                            <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Template:</span>
                            <span className="text-xs font-mono text-white/70 font-semibold">
                                {TEMPLATES.find(t => t.id === selectedTemplate)?.label}
                            </span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="w-full bg-[#00e5a0] hover:bg-[#00c87a] disabled:opacity-40 disabled:cursor-not-allowed text-[#090910] font-bold py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,229,160,0.25)] text-sm uppercase tracking-wide"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Initializing Canvas...</>
                            ) : (
                                <>Proceed to Canvas <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
