"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

export const generateExecutiveSummary = action({
    args: {
        projectId: v.id("projects"),
        findings: v.array(v.any()),
        impactScore: v.number()
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return "AI Summary unavailable: GEMINI_API_KEY environment variable is not configured in Convex.";
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
You are an expert Enterprise Security Architect and CISO advisor.
I have an architecture diagram that just underwent automated threat modeling including graph traversal and MITRE ATT&CK mapping.

Security Findings:
${JSON.stringify(args.findings.map((f: any) => ({
            component: f.description,
            severity: f.severity,
            mitreId: f.mitreId,
            mitreTactic: f.mitreTactic,
            compliance: f.complianceMappings
        })), null, 2)}

Total Exposure Score: ${args.impactScore} / 100

Write a concise, 3-paragraph executive security brief.
- Paragraph 1: Business impact — what is the blast radius if this architecture is deployed as-is?
- Paragraph 2: Top critical vulnerabilities and their MITRE ATT&CK mappings.
- Paragraph 3: Priority remediation steps for the engineering team to address immediately.

Be direct, authoritative, and specific. No markdown formatting, return plain text.
    `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });

            return response.text ?? "AI generated an empty response. Please try again.";
        } catch (error) {
            console.error("Gemini API call failed:", error);
            return "AI Summary generation failed. The Gemini API may be temporarily unavailable or the model is not accessible with your current API key.";
        }
    }
});
