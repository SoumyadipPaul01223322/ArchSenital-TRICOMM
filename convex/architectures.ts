import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveArchitecture = mutation({
    args: {
        id: v.optional(v.id("architectures")),
        name: v.string(),
        ownerId: v.string(),
        nodes: v.array(v.any()),
        edges: v.array(v.any()),
        viewport: v.object({ x: v.number(), y: v.number(), zoom: v.number() }),
    },
    handler: async (ctx, args) => {
        const { id, name, ownerId, nodes, edges, viewport } = args;

        if (id) {
            await ctx.db.patch(id, { name, nodes, edges, viewport, updatedAt: Date.now() });
            return id;
        } else {
            return await ctx.db.insert("architectures", {
                name,
                ownerId,
                nodes,
                edges,
                viewport,
                updatedAt: Date.now(),
            });
        }
    },
});

export const listArchitectures = query({
    args: { ownerId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("architectures")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
            .order("desc")
            .collect();
    },
});

export const getArchitecture = query({
    args: { id: v.id("architectures") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const deleteArchitecture = mutation({
    args: { id: v.id("architectures") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
