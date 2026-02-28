import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nodes, edges } = body.diagram;

        if (!nodes || nodes.length === 0) {
            return NextResponse.json({ success: false, error: "Empty diagram" }, { status: 400 });
        }

        const architectureContext = JSON.stringify({ nodes, edges }, null, 2);

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
- CRITICAL RULE: If a node has security features explicitly enabled (e.g. 'wafEnabled': true, 'ddosProtection': true, 'mfaRequired': true, 'encryptionAtRest': true), the attack MUST be BLOCKED at that specific layer.
- If the first layer of defense (like Cloudflare WAF, Firewall, or Edge API Gateway) is secure, the remaining killChain steps MUST show "BLOCKED" and prevent any further lateral movement.
- If the attack is successfully blocked, 'totalRiskScore' MUST be very low (e.g. 5-20), 'compromisedNodes' MUST be empty [], 'financialCost' MUST be "₹0", and 'estimatedDowntime' MUST be "0 hours" or "None".
- The 'compromisedNodes' array MUST strictly contain the literal string IDs of the nodes that were breached (as provided in the 'id' field in the JSON).
- The 'recommendedPatches' array MUST contain exact node IDs and the appropriate boolean security controls to toggle 'true' to fix the vulnerability. Do not recommend patching nodes that are already secured.
- Ensure the 'result' in each kill chain step accurately reflects whether a component stopped the attack (BLOCKED), noticed it (DETECTED), or failed to stop it (SUCCESS).
- Produce output with MAXIMUM detail, extensive enterprise-level security vocabulary, and comprehensive technical analysis.`;

        let llmResponse = "";
        let attemptPlatform = "perplexity";

        try {
            if (!process.env.PERPLEXITY_API_KEY) {
                throw new Error("PERPLEXITY_API_KEY is missing in environment.");
            }

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
        } catch (apiError) {
            console.error("Perplexity simulation failed:", apiError);
            throw apiError;
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
