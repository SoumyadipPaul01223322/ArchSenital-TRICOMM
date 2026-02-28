import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const initializeDemoData = mutation({
    args: {},
    handler: async (ctx) => {

        // Create a mock Organization
        const orgId = await ctx.db.insert("organizations", {
            name: "Acme Corp Enterprise",
            subscriptionTier: "Enterprise"
        });

        // Create a mock Project for the dashboard to populate
        const projectId = await ctx.db.insert("projects", {
            orgId: orgId,
            name: "Production Payment API",
            description: "Core payment processing pipeline containing high-sensitivity financial data.",
            riskScore: 85,
            lastScan: Date.now() - 7200000 // 2 hours ago
        });

        // Create mock Risk Report findings
        await ctx.db.insert("riskReports", {
            projectId: projectId,
            diagramId: projectId as any, // Mapped for demo purposes
            orgId: orgId,
            totalRiskScore: 85,
            classification: "Critical",
            impactScore: 60,
            findings: [
                {
                    description: "Database publicly exposed without transit encryption.",
                    severity: "Critical",
                    complianceMappings: ["OWASP A01", "SOC2 CC6.1"]
                },
                {
                    description: "API Gateway missing rate limiting definitions.",
                    severity: "High",
                    complianceMappings: ["ISO 27001"]
                }
            ],
            createdAt: Date.now() - 7200000
        });

        return { success: true, orgId };
    }
});
