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

        const systemPrompt = `You are a world-class Red Team Security Engineer and Threat Modeler.
Your goal is to analyze the provided JSON architecture and dynamically simulate a realistic cyber attack kill chain.

Follow this strict JSON schema for your output. Do not include any markdown formatting, only pure JSON:
{
  "killChain": [
    {
      "step": "Reconnaissance | Access | Execution | Privilege Escalation | Exfiltration",
      "detail": "Actionable, specific detail about how the attacker exploited a specific node in this architecture.",
      "result": "SUCCESS" | "DETECTED" | "BLOCKED"
    }
  ],
  "report": {
    "totalRiskScore": <number 0-100>,
    "compromisedNodes": [<array of node IDs that were breached>],
    "financialCost": "<string e.g. '₹2.5 Crores'>",
    "estimatedDowntime": "<string e.g. '12 hours'>",
    "findingSummary": "<A realistic 3-sentence executive summary of the architectural flaws>",
    "remediationGaps": [
      {
         "severity": "Critical" | "High" | "Medium",
         "description": "<Specific missing control e.g. Missing WAF, No MFA>",
         "complianceMappings": ["SOC2", "ISO27001"],
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
- Ensure the 'result' in each kill chain step accurately reflects whether a component stopped the attack (BLOCKED), noticed it (DETECTED), or failed to stop it (SUCCESS).`;

        let llmResponse = "";
        let attemptPlatform = "gemini";

        try {
            // Attempt 1: Gemini API
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `${systemPrompt}\n\nARCHITECTURE JSON:\n${architectureContext}`,
                config: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            });
            llmResponse = response.text || "";
        } catch (geminiError) {
            console.warn("Gemini API failed. Falling back to Perplexity...", geminiError);
            attemptPlatform = "perplexity";

            // Attempt 2: Perplexity Fallback
            if (!process.env.PERPLEXITY_API_KEY) {
                throw new Error("Both Gemini failed and PERPLEXITY_API_KEY is missing in environment.");
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
                        { role: "user", content: `Simulate an attack on this architecture and return ONLY valid JSON as requested.\n\nARCHITECTURE JSON:\n${architectureContext}` }
                    ],
                    temperature: 0.2
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
