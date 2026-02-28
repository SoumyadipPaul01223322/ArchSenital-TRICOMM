import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import DashboardClient from "./DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
};

export default async function DashboardIndex() {
    const { userId, orgId } = await auth();

    if (!userId) {
        redirect("/");
    }

    if (!orgId) {
        return (
            <div className="max-w-4xl mx-auto py-24 text-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 max-w-xl mx-auto">
                    <h2 className="text-2xl font-bold mb-3 text-white">Select an Organization</h2>
                    <p className="text-white/60 mb-8 max-w-sm mx-auto">ArchSentinel is an enterprise platform. Please create or select an organization from the top-right menu to manage architectures.</p>
                    <div className="inline-block p-1 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-transparent">
                        <div className="bg-black/80 px-4 py-2 text-sm font-medium text-cyan-400 rounded-lg backdrop-blur-md border border-white/5">
                            ↑ Use the Switcher in the Header
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Overview</h1>
                <p className="text-white/50 mt-1">Manage your enterprise architecture applications and monitor security coverage.</p>
            </div>

            <DashboardClient orgId={orgId} />
        </div>
    );
}
