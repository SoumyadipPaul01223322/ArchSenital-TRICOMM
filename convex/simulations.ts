import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSimulationHistory = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("simulationRuns")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .order("desc") // Get newest first
            .take(50); // Limit to last 50 runs
    },
});

export const saveSimulationRun = mutation({
    args: {
        orgId: v.string(),
        architectureName: v.string(),
        initialRiskScore: v.number(),
        finalRiskScore: v.number(),
        findingCount: v.number(),
        remediationsApplied: v.number(),
        status: v.union(v.literal("Completed"), v.literal("Failed"), v.literal("Interrupted")),
        runDurationMs: v.number(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("simulationRuns", {
            orgId: args.orgId,
            architectureName: args.architectureName,
            initialRiskScore: args.initialRiskScore,
            finalRiskScore: args.finalRiskScore,
            findingCount: args.findingCount,
            remediationsApplied: args.remediationsApplied,
            status: args.status,
            runDurationMs: args.runDurationMs,
            createdAt: Date.now(),
        });
        return id;
    },
});
