import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

export const generateExecutiveSummary = action({
    args: {
        projectId: v.id("projects"),
        findings: v.array(
            v.object({
                componentId: v.optional(v.string()),
                description: v.string(),
                severity: v.string(),
                complianceMappings: v.array(v.string())
            })
        ),
        impactScore: v.number()
    },
    handler: async (ctx, args) => {

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `
      You are an expert Enterprise Security Architect.
      I have an architecture diagram that just underwent automated threat modeling and graph traversal.

      Here are the security findings:
      ${JSON.stringify(args.findings, null, 2)}

      Total Impact Score: ${args.impactScore} / 100

      Write a concise, 3-paragraph executive summary of the architectural risk.
      - Paragraph 1: Business impact (what happens if we deploy this).
      - Paragraph 2: The critical vulnerabilities found.
      - Paragraph 3: Recommended mitigation steps for the engineering team.
      
      Do not use markdown formatting, return plain text.
    `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            return response.text;
        } catch (error) {
            console.error("Failed to generate AI summary", error);
            return "AI Summary unavailable. Please check API configuration.";
        }
    }
});
