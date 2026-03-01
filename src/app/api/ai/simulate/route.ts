import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nodes, edges } = body.diagram;

        if (!nodes || nodes.length === 0) {
            return NextResponse.json({ success: false, error: "Empty diagram" }, { status: 400 });
        }

        // --- INTELLIGENT COMPONENT VERSION MAPPING ---
        // Dynamically inject highly specific, outdated software/firmware versions to feed the AI generator explicitly vulnerable configurations.
        const COMPONENT_VERSION_MAP: Record<string, any> = {
            'core_router': { simulatedVersion: 'Cisco 2900 Series, IOS 15.2(4)M1', knownVulns: 'IKEv1 Information Disclosure (CVE-2016-1287), default SNMP strings' },
            'edge_router': { simulatedVersion: 'Cisco ASR 1000 Series, IOS XE 16.6.1', knownVulns: 'REST API Auth Bypass (CVE-2019-12643)' },
            'l3_switch': { simulatedVersion: 'Cisco Catalyst 3850, IOS XE 16.3.1', knownVulns: 'Smart Install Client RCE (CVE-2018-0171)' },
            'l2_switch': { simulatedVersion: 'Cisco Catalyst 2960-X', knownVulns: 'CDP Parsing DoS / CDPwn' },
            'cdn_edge': { simulatedVersion: 'Cloudflare Edge Node (Misconfigured)', knownVulns: 'Origin IP Leakage, Cache Poisoning' },
            'web_server': { simulatedVersion: 'Apache 2.4.49', knownVulns: 'Path Traversal RCE (CVE-2021-41773)' },
            'app_server': { simulatedVersion: 'Tomcat 9.0.30', knownVulns: 'Ghostcat (CVE-2020-1938)' },
            'db_server': { simulatedVersion: 'PostgreSQL 10.5', knownVulns: 'Outdated vulnerable extensions, Auth bypass' },
            'mail_server': { simulatedVersion: 'Microsoft Exchange Server 2019 CU8', knownVulns: 'ProxyLogon / ProxyShell RCE' },
            'file_server': { simulatedVersion: 'Samba 4.13.17', knownVulns: 'SMBv1 enabled, Anonymous access allowed' },
            'vps_linux': { simulatedVersion: 'Ubuntu 18.04 LTS (Kernel 4.15)', knownVulns: 'Polkit PwnKit (CVE-2021-4034), Dirty COW' },
            'vps_windows': { simulatedVersion: 'Windows Server 2012 R2', knownVulns: 'EternalBlue, ZeroLogon' },
            'ngfw': { simulatedVersion: 'Fortinet FortiOS 7.2.2', knownVulns: 'SSL-VPN RCE (CVE-2022-42475)' },
            'waf': { simulatedVersion: 'F5 BIG-IP 15.1.0', knownVulns: 'TMUI RCE (CVE-2020-5902)' },
            'vpn_gw': { simulatedVersion: 'Pulse Secure 9.0R3', knownVulns: 'Arbitrary File Read (CVE-2019-11510)' },
            'wazuh': { simulatedVersion: 'Wazuh App v4.1', knownVulns: 'No immediate RCE, but poor log retention' },
            'splunk': { simulatedVersion: 'Splunk Enterprise 8.2.1', knownVulns: 'Universal Forwarder RCE risk' },
            'k8s_cluster': { simulatedVersion: 'K8s v1.21 (EOL)', knownVulns: 'Anonymous API access, Privileged Pod Escalation' },
            'github_actions': { simulatedVersion: 'GitLab 13.10', knownVulns: 'ExifTool RCE (CVE-2021-22205)' },
            's3_bucket': { simulatedVersion: 'AWS S3 Standard', knownVulns: 'Public Read/Write ACLs misconfigured' },
            'windows_pc': { simulatedVersion: 'Windows 10 v1909', knownVulns: 'PrintNightmare (CVE-2021-34527)' },
            'iot_device': { simulatedVersion: 'Hikvision IP Camera fw v5.5.0', knownVulns: 'Default admin credentials, Command injection' }
        };

        const enhancedNodes = nodes.map((n: any) => {
            if (n.data?.subtype && COMPONENT_VERSION_MAP[n.data.subtype]) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        ...COMPONENT_VERSION_MAP[n.data.subtype]
                    }
                };
            }
            return n;
        });

        const architectureContext = JSON.stringify({ nodes: enhancedNodes, edges }, null, 2);

        const systemPrompt = `You are a world-class Enterprise Cloud Security Architect, Red Team Lead, and CISO Advisor.
Your goal is to deeply analyze the provided JSON architecture and dynamically simulate a highly realistic, technically rigorous cyber attack kill chain.

Follow this strict JSON schema for your output. Do not include any markdown formatting, only pure JSON:
{
  "killChain": [
    {
      "step": "Reconnaissance | Initial Access | Execution | Privilege Escalation | Defense Evasion | Lateral Movement | Exfiltration",
      "detail": "Provide a deeply technical, multi-sentence explanation of the exact exploit used, the specific service targeted, and the methodology (e.g., 'Attacker utilized an unauthenticated Server-Side Request Forgery (SSRF) vulnerability on the API Gateway to bypass perimeter controls...'). Do not skimp on technical detail.",
      "result": "SUCCESS" | "DETECTED" | "BLOCKED"
    },
    // Generate at least 5-7 highly detailed steps
  ],
  "report": {
    "totalRiskScore": <number 0-100>,
    "compromisedNodes": [<array of node IDs that were breached>],
    "financialCost": "<string e.g. '₹12.5 Crores ($1.5M USD)'>",
    "estimatedDowntime": "<string e.g. '48-72 hours impact'>",
    "findingSummary": "<An extremely comprehensive, professional, 8-12 sentence executive security brief suitable for a Board of Directors. It must explicitly detail the core structural vulnerabilities, the hypothetical breach timeline, the potential impact on data sovereignty and compliance, and the overarching security posture analysis. Use highly professional enterprise terminology.>",
    "remediationGaps": [
      {
         "severity": "Critical" | "High" | "Medium",
         "description": "<A huge, deeply detailed paragraph explaining exactly what the vulnerability is, the exploit mechanics, the specific compliance violations (e.g., SOC2 CC6.1, ISO27001 A.11), and the precise technical justification for the recommended patch. Be incredibly verbose and educational.>",
         "complianceMappings": ["SOC2", "ISO27001", "HIPAA", "PCI-DSS", "GDPR"],
         "recommendedPatches": [
            {
               "nodeId": "<exact string ID of the vulnerable node from the JSON, e.g. 'node-123'>",
               "patch": { "wafEnabled": true, "ddosProtection": true, "encryptionAtRest": true, "encryptionInTransit": true, "mfaRequired": true, "localFirewall": true, "antivirusEnabled": true }
            }
         ]
      }
    ]
  }
}

Analyze the architecture comprehensively:
- CRITICAL RULE: If a node has 'isActive': false in its data payload, it is POWERED OFF and completely offline. It CANNOT be compromised, it CANNOT be used in the kill chain, and it MUST NOT be included in 'compromisedNodes'.
- CRITICAL RULE: If a node has security features explicitly enabled (e.g. 'wafEnabled': true, 'ddosProtection': true, 'mfaRequired': true, 'encryptionAtRest': true), the attack MUST be BLOCKED at that specific layer.
- If the first layer of defense (like Cloudflare WAF, Firewall, or Edge API Gateway) is secure, the remaining killChain steps MUST show "BLOCKED" and prevent any further lateral movement.
- If the attack is successfully blocked, 'totalRiskScore' MUST be very low (e.g. 5-20), 'compromisedNodes' MUST be empty [], 'financialCost' MUST be "₹0", and 'estimatedDowntime' MUST be "0 hours" or "None".
- The 'compromisedNodes' array MUST strictly contain the literal string IDs of the nodes that were breached (as provided in the 'id' field in the JSON).
- The 'recommendedPatches' array MUST contain exact node IDs and the appropriate boolean security controls to toggle 'true' to fix the vulnerability. Do not recommend patching nodes that are already secured.
- Ensure the 'result' in each kill chain step accurately reflects whether a component stopped the attack (BLOCKED), noticed it (DETECTED), or failed to stop it (SUCCESS).
- Produce output with MAXIMUM detail, extensive enterprise-level security vocabulary, and comprehensive technical analysis.
- IMPORTANT REALISM RULE: The JSON explicitly includes "simulatedVersion" and "knownVulnerabilities" for each component (e.g., Apache 2.4.49, Cisco IOS vulnerabilities). Your kill chain narrative MUST explicitly reference these exact versions and exploit those specific CVEs mechanically in the simulation. Do not invent generic attacks when a CVE is provided.`;

        let llmResponse = "";
        let attemptPlatform = "perplexity";

        try {
            if (!process.env.PERPLEXITY_API_KEY) {
                throw new Error("PERPLEXITY_API_KEY is missing in environment.");
            }

            console.log("Attempting Perplexity AI simulation...");
            const perpRes = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Please execute the highly detailed security simulation. Output ONLY valid JSON, adhering EXACTLY to my requested schema.\n\nARCHITECTURE JSON:\n${architectureContext}` }
                    ],
                    temperature: 0.3
                })
            });

            if (!perpRes.ok) {
                const errText = await perpRes.text();
                throw new Error(`Perplexity API Error: ${perpRes.status} ${errText}`);
            }

            const perpData = await perpRes.json();
            llmResponse = perpData.choices[0].message.content;

            // Clean up Markdown backticks if Perplexity returns them
            llmResponse = llmResponse.replace(/(^```json\s*|^```\s*|```$)/gm, '').trim();

        } catch (apiError: any) {
            console.warn(`Perplexity simulation failed (${apiError.message}). Falling back to Google Gemini...`);
            attemptPlatform = "gemini";

            if (!process.env.GOOGLE_GENAI_API_KEY) {
                throw new Error(`Fallback failed: GOOGLE_GENAI_API_KEY is missing in environment. Original Error: ${apiError.message}`);
            }

            const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt + `\n\nARCHITECTURE JSON:\n${architectureContext}` }] }
                ],
                config: {
                    temperature: 0.3,
                    responseMimeType: "application/json",
                }
            });

            if (!response.text) {
                throw new Error("Gemini returned an empty response during fallback.");
            }
            llmResponse = response.text.trim();
        }

        // Parse JSON output
        let simulationPayload;
        try {
            simulationPayload = JSON.parse(llmResponse);
        } catch (parseError) {
            console.error("Failed to parse LLM Response:", llmResponse);
            throw new Error(`Failed to parse AI JSON response correctly via ${attemptPlatform}.`);
        }

        return NextResponse.json({
            success: true,
            platform: attemptPlatform,
            simulation: simulationPayload
        });

    } catch (error: any) {
        console.error("AI Simulation Engine Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
