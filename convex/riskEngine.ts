import { mutation } from "./_generated/server";
import { v } from "convex/values";

interface FindingDetail {
    message: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    mitreTactic: string;
    mitreTechnique: string;
    mitreId: string;
    remediationCode?: string;
    complianceMappings: string[];
}

function calculateBaseVulnerability(nodeData: any) {
    let vulnerabilityScore = 0;
    let localFindings: FindingDetail[] = [];

    // Network Vulnerabilities
    if (nodeData.exposure === "Public") {
        vulnerabilityScore += 15;
        localFindings.push({
            message: "Component is publicly exposed to the internet.",
            severity: 'High',
            mitreTactic: "Initial Access",
            mitreTechnique: "Exploit Public-Facing Application",
            mitreId: "T1190",
            complianceMappings: ["SOC2 CC6.6", "ISO 27001:A.13.1.1"]
        });
    }

    // Security Vulnerabilities
    if (nodeData.componentType === 'api') {
        if (nodeData.authType === "None") {
            vulnerabilityScore += 25;
            localFindings.push({
                message: "Critical: API Endpoint lacks authentication.",
                severity: 'Critical',
                mitreTactic: "Credential Access",
                mitreTechnique: "Exploit Public-Facing Application",
                mitreId: "T1190",
                complianceMappings: ["OWASP A07:2021", "SOC2 CC6.1"],
                remediationCode: `resource "aws_api_gateway_authorizer" "jwt" {\n  name = "jwt-auth"\n  rest_api_id = aws_api_gateway_rest_api.api.id\n  type = "COGNITO_USER_POOLS"\n  provider_arns = [aws_cognito_user_pool.pool.arn]\n}`
            });
        }
        if (nodeData.inputValidation === false) {
            vulnerabilityScore += 10;
            localFindings.push({
                message: "API Input Validation is disabled (Injection Risk).",
                severity: 'High',
                mitreTactic: "Execution",
                mitreTechnique: "Command and Scripting Interpreter",
                mitreId: "T1059",
                complianceMappings: ["OWASP A03:2021", "NIST SP 800-53 SI-10"],
                remediationCode: `resource "aws_wafv2_web_acl" "api_waf" {\n  name = "api-waf"\n  scope = "REGIONAL"\n  default_action { allow {} }\n  rule {\n    name = "AWSManagedRulesCommonRuleSet"\n    priority = 1\n    override_action { none {} }\n    statement {\n      managed_rule_group_statement {\n        name = "AWSManagedRulesCommonRuleSet"\n        vendor_name = "AWS"\n      }\n    }\n    visibility_config {\n      cloudwatch_metrics_enabled = true\n      metric_name = "AWSManagedRulesCommonRuleSetMetric"\n      sampled_requests_enabled = true\n    }\n  }\n}`
            });
        }
    }

    if (nodeData.componentType === 'db') {
        if (!nodeData.encryptionAtRest) {
            vulnerabilityScore += 15;
            localFindings.push({
                message: "High: Database is missing Encryption at Rest.",
                severity: 'Critical',
                mitreTactic: "Impact",
                mitreTechnique: "Data Encrypted for Impact",
                mitreId: "T1486",
                complianceMappings: ["SOC2 CC6.1", "GDPR Art. 32"],
                remediationCode: `resource "aws_db_instance" "secure_db" {\n  # ... other config\n  storage_encrypted = true\n  kms_key_id        = aws_kms_key.db_key.arn\n}`
            });
        }
        if (!nodeData.auditLoggingEnabled) {
            vulnerabilityScore += 5;
            localFindings.push({
                message: "Database audit logging is disabled.",
                severity: 'Medium',
                mitreTactic: "Defense Evasion",
                mitreTechnique: "Indicator Removal on Host",
                mitreId: "T1070",
                complianceMappings: ["SOC2 CC7.2", "HIPAA 164.312(b)"]
            });
        }
    }

    if (nodeData.encryptionInTransit === false) {
        vulnerabilityScore += 15;
        localFindings.push({
            message: "Traffic to component is unencrypted (No TLS/HTTPS).",
            severity: 'High',
            mitreTactic: "Credential Access",
            mitreTechnique: "Network Sniffing",
            mitreId: "T1040",
            complianceMappings: ["SOC2 CC6.1", "PCI-DSS 4.1"]
        });
    }

    if (nodeData.componentType === 'firewall') {
        if (nodeData.defaultPolicy === "Allow All (Insecure)") {
            vulnerabilityScore += 30;
            localFindings.push({
                message: "Critical: Firewall default policy is overly permissive (Allow All).",
                severity: 'Critical',
                mitreTactic: "Discovery",
                mitreTechnique: "Network Service Discovery",
                mitreId: "T1046",
                complianceMappings: ["SOC2 CC6.6", "ISO 27001:A.13.1.1"]
            });
        }
        if (nodeData.enableIDS === false) {
            vulnerabilityScore += 10;
            localFindings.push({
                message: "Firewall IDS/IPS is disabled.",
                severity: 'Medium',
                mitreTactic: "Defense Evasion",
                mitreTechnique: "Impair Defenses",
                mitreId: "T1562",
                complianceMappings: ["SOC2 CC7.2"]
            });
        }
    }

    // Availability
    if (nodeData.instanceCount === 1 && !nodeData.autoScaling) {
        vulnerabilityScore += 5;
        localFindings.push({
            message: "Single Point of Failure: Instance count is 1 with no Auto-Scaling.",
            severity: 'Medium',
            mitreTactic: "Impact",
            mitreTechnique: "Endpoint Denial of Service",
            mitreId: "T1499",
            complianceMappings: ["SOC2 A1.2"]
        });
    }

    // Impact Weighting based on Data
    const sensitivity = parseInt(nodeData.sensitivityLevel?.toString() || '1');
    const impactMultiplier = 1 + (sensitivity * 0.1);

    const finalScore = Math.round(vulnerabilityScore * impactMultiplier);

    if (sensitivity >= 4 && finalScore > 0) {
        localFindings.push({
            message: `Elevated risk modifier applied due to hosting highly sensitive data (${nodeData.dataType}).`,
            severity: 'High',
            mitreTactic: "Exfiltration",
            mitreTechnique: "Exfiltration Over C2 Channel",
            mitreId: "T1041",
            complianceMappings: ["GDPR Art. 9", "HIPAA"]
        });
    }

    return { score: finalScore, findings: localFindings, sensitivity };
}

export const simulateAttack = mutation({
    args: { diagramId: v.id("diagrams") },
    handler: async (ctx, args) => {
        const diagram = await ctx.db.get(args.diagramId);

        if (!diagram) throw new Error("Graph not found");

        const nodes = diagram.nodes;
        const edges = diagram.edges;

        // 1. Build Adjacency List for O(V+E) performance
        const adjacencyList = new Map<string, string[]>();
        nodes.forEach((node: any) => adjacencyList.set(node.id, []));

        edges.forEach((edge: any) => {
            adjacencyList.get(edge.source)?.push(edge.target);
        });

        // 2. Pre-calculate Base Vulnerabilities per Node
        const nodeMap = new Map();
        const nodeVulnerabilities = new Map();

        nodes.forEach((node: any) => {
            nodeMap.set(node.id, node);
            nodeVulnerabilities.set(node.id, calculateBaseVulnerability(node.data));
        });

        // 3. DFS Engine for Lateral Movement (Blast Radius)
        const compromised = new Set<string>();
        const visited = new Set<string>();

        // Attackers start at Public/Internet exposed nodes
        const entryPoints = nodes.filter((n: any) => n.data.exposure === "Public" || n.data.componentType === "internet");

        function isCompromisable(currentNodeId: string, sourceNodeId: string | null) {
            const vulnData = nodeVulnerabilities.get(currentNodeId);

            // If the node has a high internal vulnerability score, it falls immediately
            if (vulnData.score >= 20) return true;

            // If an attacker comes through an unencrypted connection
            if (sourceNodeId) {
                const sourceNode = nodeMap.get(sourceNodeId);
                // Simple rule: if source is compromised and current node has no strong auth, it falls laterally
                if (vulnData.score > 0) return true;
            }

            // Internet nodes are entry points and always "compromisable" from the outside
            if (nodeMap.get(currentNodeId).data.componentType === "internet") return true;

            return false;
        }

        function dfs(currentNodeId: string, sourceNodeId: string | null) {
            if (visited.has(currentNodeId)) return;
            visited.add(currentNodeId);

            if (isCompromisable(currentNodeId, sourceNodeId)) {
                compromised.add(currentNodeId);

                const neighbors = adjacencyList.get(currentNodeId) || [];
                for (const neighborId of neighbors) {
                    dfs(neighborId, currentNodeId);
                }
            }
        }

        for (const entry of entryPoints) {
            dfs(entry.id, null);
        }

        // 4. Aggregation and Compliance Mapping
        let totalSystemRisk = 0;
        const allFindings: {
            componentId: string,
            description: string,
            severity: 'Critical' | 'High' | 'Medium' | 'Low',
            complianceMappings: string[],
            mitreTactic?: string,
            mitreTechnique?: string,
            mitreId?: string,
            remediationCode?: string
        }[] = [];

        nodes.forEach((node: any) => {
            const vuln = nodeVulnerabilities.get(node.id);
            totalSystemRisk += vuln.score;

            // Map findings to framework
            vuln.findings.forEach((f: FindingDetail) => {
                allFindings.push({
                    componentId: node.id,
                    description: `[${node.data.label || node.id}] ${f.message}`,
                    severity: f.severity,
                    complianceMappings: f.complianceMappings,
                    mitreTactic: f.mitreTactic,
                    mitreTechnique: f.mitreTechnique,
                    mitreId: f.mitreId,
                    remediationCode: f.remediationCode
                });
            });
        });

        // Multiply total risk by blast radius percentage
        const blastRadiusPercentage = compromised.size / Math.max(nodes.length, 1);
        let finalQuantifiedRisk = Math.round(totalSystemRisk * (1 + blastRadiusPercentage));

        // Scale to 0-100 logically
        if (finalQuantifiedRisk > 100) finalQuantifiedRisk = 100;
        if (nodes.length === 0) finalQuantifiedRisk = 0;

        // Update risk model in Convex DB
        await ctx.db.patch(diagram._id, { riskScore: finalQuantifiedRisk });
        await ctx.db.patch(diagram.projectId, { riskScore: finalQuantifiedRisk });

        return {
            compromisedNodes: Array.from(compromised),
            impactScore: Math.round(finalQuantifiedRisk),
            findings: allFindings
        };
    }
});
