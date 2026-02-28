import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listApiKeys = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const keys = await ctx.db
            .query("apiKeys")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .order("desc")
            .collect();
        return keys;
    },
});

export const createApiKey = mutation({
    args: {
        orgId: v.string(),
        name: v.string(),
        role: v.union(v.literal("admin"), v.literal("developer"), v.literal("readonly"), v.literal("ci_runner"))
    },
    handler: async (ctx, args) => {
        // Generate a random 32-character hex string for the key
        const randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);
        const hexString = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const apiKey = `sk_live_${hexString}`;

        const newId = await ctx.db.insert("apiKeys", {
            orgId: args.orgId,
            name: args.name,
            key: apiKey,
            role: args.role,
            createdAt: Date.now(),
        });

        return { id: newId, key: apiKey };
    },
});

export const revokeApiKey = mutation({
    args: { orgId: v.string(), id: v.id("apiKeys") },
    handler: async (ctx, args) => {
        const apiKey = await ctx.db.get(args.id);
        if (!apiKey || apiKey.orgId !== args.orgId) {
            throw new Error("API Key not found or unauthorized");
        }
        await ctx.db.delete(args.id);
        return { success: true };
    },
});
