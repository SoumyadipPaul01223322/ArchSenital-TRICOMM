import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const defaultSettings = {
    auditLogging: true,
    ipAllowlisting: false,
    apiKeyRotationDays: 90,
    alertCriticalFindings: true,
    alertWeeklyDigest: true,
    alertScanCompletion: false,
};

export const getSettings = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const settings = await ctx.db
            .query("orgSettings")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();

        // Return defaults if none found
        return settings || { orgId: args.orgId, ...defaultSettings };
    },
});

export const updateSettings = mutation({
    args: {
        orgId: v.string(),
        updates: v.object({
            auditLogging: v.optional(v.boolean()),
            ipAllowlisting: v.optional(v.boolean()),
            apiKeyRotationDays: v.optional(v.number()),
            alertCriticalFindings: v.optional(v.boolean()),
            alertWeeklyDigest: v.optional(v.boolean()),
            alertScanCompletion: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("orgSettings")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, args.updates);
            return existing._id;
        } else {
            const newId = await ctx.db.insert("orgSettings", {
                orgId: args.orgId,
                ...defaultSettings,
                ...args.updates,
            });
            return newId;
        }
    },
});
