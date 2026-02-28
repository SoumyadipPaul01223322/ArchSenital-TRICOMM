import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Core Projects Logic
export const getOrgProjects = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .order("desc")
            .collect();
    },
});

export const createProject = mutation({
    args: {
        orgId: v.string(),
        name: v.string(),
        description: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const projectId = await ctx.db.insert("projects", {
            orgId: args.orgId,
            name: args.name,
            description: args.description || "",
            riskScore: 0,
        });
        return projectId;
    }
});

// 2. Diagrams & Modeling Logic
export const getDiagram = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("diagrams")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();
    }
});

export const saveDiagram = mutation({
    args: {
        projectId: v.id("projects"),
        orgId: v.string(),
        nodes: v.array(v.any()), // Accepting generic React Flow nodes
        edges: v.array(v.any()), // Accepting generic React Flow edges
    },
    handler: async (ctx, args) => {

        // Check if diagram exists
        const existing = await ctx.db
            .query("diagrams")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();

        // The Risk Engine Hook! -- Trigger risk recalculation here.
        // For now, we mock a random score to show it works
        const computedRisk = Math.floor(Math.random() * 80) + 10;

        if (existing) {
            // Update
            await ctx.db.patch(existing._id, {
                nodes: args.nodes,
                edges: args.edges,
                riskScore: computedRisk
            });

            // Also update project summary score
            await ctx.db.patch(args.projectId, { riskScore: computedRisk, lastScan: Date.now() });

            return existing._id;
        } else {
            // Create new
            const newId = await ctx.db.insert("diagrams", {
                projectId: args.projectId,
                orgId: args.orgId,
                nodes: args.nodes,
                edges: args.edges,
                riskScore: computedRisk
            });

            await ctx.db.patch(args.projectId, { riskScore: computedRisk, lastScan: Date.now() });
            return newId;
        }
    }
});

// 3. Analytics & Org Dashboard
export const getOrgRiskSummary = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        const totalProjects = projects.length;
        const highRisk = projects.filter(p => p.riskScore > 70).length;
        const lowRisk = projects.filter(p => p.riskScore < 30).length;

        const avgRisk = totalProjects > 0
            ? Math.round(projects.reduce((acc, p) => acc + p.riskScore, 0) / totalProjects)
            : 0;

        return {
            totalProjects,
            highRiskCount: highRisk,
            lowRiskCount: lowRisk,
            averageOrgRisk: avgRisk
        };
    }
});
