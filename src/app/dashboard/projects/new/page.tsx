"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function NewProjectPage() {
    const router = useRouter();
    const { orgId } = useAuth();
    const createProject = useMutation(api.architecture.createProject);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId || !name) return;
        setLoading(true);

        try {
            const projectId = await createProject({ orgId, name, description });
            router.push(`/dashboard/architect?id=${projectId}`);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12">
            <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <ShieldAlert className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/90">Create Architecture Model</h1>
                    <p className="text-white/40 text-sm mt-1 tracking-wide">Define a new system boundary for threat modeling.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[#0c0c0c] border border-white/5 shadow-2xl p-8 rounded-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="space-y-2 relative z-10">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/40">Application Name</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Production Payment API"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                    />
                </div>

                <div className="space-y-2 relative z-10">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/40">Description</label>
                    <textarea
                        placeholder="Briefly describe the components and data flows..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full bg-black/60 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-sans"
                    />
                </div>

                <div className="pt-6 relative z-10">
                    <button
                        type="submit"
                        disabled={loading || !name}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 text-black font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                    >
                        <span>{loading ? "INITIALIZING WORKSPACE..." : "PROCEED TO CANVAS"}</span>
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
