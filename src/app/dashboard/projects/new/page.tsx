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
                <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                    <ShieldAlert className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Architecture Model</h1>
                    <p className="text-white/50 text-sm">Define a new system boundary for threat modeling.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="space-y-2 relative z-10">
                    <label className="text-sm font-medium text-white/80">Application Name</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Production Payment API"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>

                <div className="space-y-2 relative z-10">
                    <label className="text-sm font-medium text-white/80">Description</label>
                    <textarea
                        placeholder="Briefly describe the components and data flows..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                </div>

                <div className="pt-4 relative z-10">
                    <button
                        type="submit"
                        disabled={loading || !name}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        <span>{loading ? "Initializing..." : "Proceed to Canvas"}</span>
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
