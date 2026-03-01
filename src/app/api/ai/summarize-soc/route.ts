import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nodes, edges, simulationResults, financialImpact } = body;

        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

        const prompt = `You are an expert Security Operations Center (SOC) Lead Analyst tracking a major breach. 
        Read the following live simulation data from our cloud architecture:
        
        Nodes: ${JSON.stringify(nodes.map((n: any) => ({ id: n.id, type: n.type, name: n.data.name })))}
        Edges: ${JSON.stringify(edges.map((e: any) => ({ source: e.source, target: e.target })))}
        Kill Chain Events: ${JSON.stringify(simulationResults.killChain || [])}
        Vulnerability Gaps Found: ${JSON.stringify(simulationResults.report?.remediationGaps || [])}
        Estimated Financial Impact: Rs ${financialImpact?.rangeLow || 0}Cr to ${financialImpact?.rangeHigh || 0}Cr
        
        Generate a highly detailed, professional SOC Threat Hunting Report. 
        Return ONLY a JSON object (no markdown, no backticks, just raw JSON) with the following exact structure:
        {
            "executiveSummary": "A 2-paragraph professional summary of the breach, the timeline, the immediate financial/data impact, and the critical failure points.",
            "threatHypothesis": "What is the detailed theory on how the attacker achieved initial access, escalation, and exfiltration?",
            "riskMetrics": {
                "overallRiskScore": 1-100,
                "categories": {
                    "networkSecurity": 1-100,
                    "identityAccess": 1-100,
                    "dataProtection": 1-100,
                    "endpointSecurity": 1-100,
                    "monitoring": 1-100
                },
                "heatmapMatrix": [
                    { "vector": "Phishing", "likelihood": "High|Medium|Low", "impact": "High|Medium|Low" },
                    { "vector": "Exploit Public-Facing App", "likelihood": "High|Medium|Low", "impact": "High|Medium|Low" },
                    { "vector": "Valid Accounts", "likelihood": "High|Medium|Low", "impact": "High|Medium|Low" },
                    { "vector": "Supply Chain", "likelihood": "High|Medium|Low", "impact": "High|Medium|Low" }
                ]
            },
            "keyFindings": [ { "title": "String", "severity": "Critical|High|Medium", "description": "String" } ],
            "recommendedActions": [ { "phase": "Containment|Eradication|Recovery", "action": "String" } ]
        }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const textResponse = response.text;

        if (!textResponse) {
            throw new Error('No content returned from Gemini API');
        }

        const jsonSummary = JSON.parse(textResponse);

        return NextResponse.json(jsonSummary);

    } catch (err: any) {
        console.error('Error generating SOC summary:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
