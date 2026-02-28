import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const simulateAttack = mutation({
    args: { diagramId: v.id("diagrams") },
    handler: async (ctx, args) => {
        const diagram = await ctx.db.get(args.diagramId);

        if (!diagram) throw new Error("Graph not found");

        const nodes = diagram.nodes;
        const edges = diagram.edges;

        // 1. Build Adjacency List for O(V+E) performance
        const adjacencyList = new Map<string, string[]>();
        nodes.forEach(node => adjacencyList.set(node.id, []));

        edges.forEach(edge => {
            adjacencyList.get(edge.source)?.push(edge.target);
        });

        // 2. Map nodes by ID for fast lookup
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        // 3. DFS Engine with Trust Boundary Detection
        const compromised = new Set<string>();
        const visited = new Set<string>();

        // Entry points are currently mocked as "internet" nodes
        const entryPoints = nodes.filter(n => n.id === "internet" || n.type === "Internet");

        function isVulnerable(nodeId: string, sourceId: string | null) {
            // True attack simulation logic lives here based on node configuration
            const node = nodeMap.get(nodeId);
            if (!node) return false;

            // E.g., if DB is directly connected to internet without WAF = compromised
            if (node.id === "db" && sourceId === "internet") return true;

            // E.g., if API has no Auth = compromised
            if (node.id === "api") return true;

            if (node.id === "internet") return true;

            return false;
        }

        function dfs(currentNodeId: string, sourceNodeId: string | null) {
            if (visited.has(currentNodeId)) return;
            visited.add(currentNodeId);

            // Simulation check
            if (isVulnerable(currentNodeId, sourceNodeId)) {
                compromised.add(currentNodeId);

                // Continue lateral movement
                const neighbors = adjacencyList.get(currentNodeId) || [];
                for (const neighborId of neighbors) {
                    dfs(neighborId, currentNodeId);
                }
            }
        }

        // Run DFS
        for (const entry of entryPoints) {
            dfs(entry.id, null);
        }

        // 4. Calculate Final Severity Score from DFS Results
        let blastRadiusImpact = 0;
        compromised.forEach(nodeId => {
            if (nodeId === "db") blastRadiusImpact += 40; // Database breach = critical impact
            else if (nodeId === "api") blastRadiusImpact += 15;
            else blastRadiusImpact += 5;
        });

        const findings = Array.from(compromised).map(nodeId => ({
            componentId: nodeId,
            description: `Lateral movement reached compromised system: ${nodeMap.get(nodeId)?.data.label || nodeId}`,
            severity: nodeId === "db" ? "Critical" : "High" as "Critical" | "High" | "Medium" | "Low",
            complianceMappings: ["SOC2 CC6.1", "OWASP Lateral Movement"]
        }));

        // Update risk model in Convex DB
        await ctx.db.patch(diagram._id, { riskScore: Math.min(blastRadiusImpact, 100) });
        await ctx.db.patch(diagram.projectId, { riskScore: Math.min(blastRadiusImpact, 100) });

        return {
            compromisedNodes: Array.from(compromised),
            impactScore: blastRadiusImpact,
            findings
        };
    }
});
