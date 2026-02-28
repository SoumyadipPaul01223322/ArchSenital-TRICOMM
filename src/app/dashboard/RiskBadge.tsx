"use client";

import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";

export default function RiskBadge() {
    const { orgId } = useAuth();
    const summary = useQuery(api.architecture.getOrgRiskSummary, orgId ? { orgId } : "skip");

    if (!summary || summary.highRiskCount === 0) return null;

    return (
        <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            {summary.highRiskCount} Critical Risk{summary.highRiskCount !== 1 ? 's' : ''} Found
        </div>
    );
}
