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

function getTemplatePayload(templateId?: string) {
    if (!templateId || templateId === "blank") return { nodes: [], edges: [] };

    let nodes: any[] = [];
    let edges: any[] = [];

    if (templateId === "3tier") {
        nodes = [
            { id: "glb", type: "router", position: { x: 250, y: 50 }, data: { label: "Global LB", subtype: "edge_router", icon: "Activity" } },
            { id: "waf", type: "firewall", position: { x: 250, y: 150 }, data: { label: "AWS WAF", subtype: "waf", icon: "Shield" } },
            { id: "web", type: "server", position: { x: 100, y: 250 }, data: { label: "Web Server 1", subtype: "web_server", icon: "Server" } },
            { id: "app", type: "server", position: { x: 100, y: 350 }, data: { label: "App Server", subtype: "app_server", icon: "Server" } },
            { id: "db", type: "database", position: { x: 250, y: 450 }, data: { label: "RDS Cluster", subtype: "db_cluster", icon: "Database" } },
        ];
        edges = [
            { id: "e1", source: "glb", target: "waf" },
            { id: "e2", source: "waf", target: "web" },
            { id: "e3", source: "web", target: "app" },
            { id: "e4", source: "app", target: "db" },
        ];
    } else if (templateId === "microservices") {
        nodes = [
            { id: "gw", type: "api", position: { x: 250, y: 100 }, data: { label: "API Gateway", subtype: "api_gw", icon: "Globe" } },
            { id: "auth", type: "iam", position: { x: 400, y: 100 }, data: { label: "Auth Provider", subtype: "idp", icon: "Key" } },
            { id: "k8s", type: "k8s", position: { x: 250, y: 250 }, data: { label: "K8s Cluster", subtype: "k8s_cluster", icon: "Box" } },
            { id: "db", type: "database", position: { x: 250, y: 400 }, data: { label: "Mongo DB", subtype: "db_cluster", icon: "Database" } },
        ];
        edges = [
            { id: "e1", source: "gw", target: "k8s" },
            { id: "e2", source: "gw", target: "auth" },
            { id: "e3", source: "k8s", target: "db" },
        ];
    } else if (templateId === "aws") {
        nodes = [
            { id: "cdn", type: "cdn", position: { x: 250, y: 50 }, data: { label: "CloudFront", subtype: "cdn_edge", icon: "Cloud" } },
            { id: "waf", type: "firewall", position: { x: 250, y: 150 }, data: { label: "WAF", subtype: "waf", icon: "Shield" } },
            { id: "ec2", type: "server", position: { x: 250, y: 300 }, data: { label: "EC2 AutoScale", subtype: "app_server", icon: "Server" } },
            { id: "rds", type: "database", position: { x: 100, y: 450 }, data: { label: "RDS PostgreSQL", subtype: "db_cluster", icon: "Database" } },
            { id: "s3", type: "storage", position: { x: 400, y: 450 }, data: { label: "S3 Bucket", subtype: "s3_bucket", icon: "Database" } },
        ];
        edges = [
            { id: "e1", source: "cdn", target: "waf" },
            { id: "e2", source: "waf", target: "ec2" },
            { id: "e3", source: "ec2", target: "rds" },
            { id: "e4", source: "ec2", target: "s3" },
        ];
    } else if (templateId === "database") {
        nodes = [
            { id: "k8s", type: "k8s", position: { x: 250, y: 100 }, data: { label: "Ingestion K8s", subtype: "k8s_cluster", icon: "Box" } },
            { id: "s3", type: "storage", position: { x: 250, y: 250 }, data: { label: "Data Lake (S3)", subtype: "s3_bucket", icon: "Database" } },
            { id: "db", type: "database", position: { x: 250, y: 400 }, data: { label: "Data Warehouse", subtype: "db_cluster", icon: "Database" } },
        ];
        edges = [
            { id: "e1", source: "k8s", target: "s3" },
            { id: "e2", source: "s3", target: "db" },
        ];
    }

    return { nodes, edges };
}

export const createProject = mutation({
    args: {
        orgId: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        templateId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const projectId = await ctx.db.insert("projects", {
            orgId: args.orgId,
            name: args.name,
            description: args.description || "",
            riskScore: 0,
        });

        const { nodes, edges } = getTemplatePayload(args.templateId);

        await ctx.db.insert("diagrams", {
            projectId: projectId,
            orgId: args.orgId,
            nodes: nodes,
            edges: edges,
            riskScore: 0
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
