import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const SuggestVersionSchema = z.object({
    nodeData: z.object({
        type: z.string().optional(),
        subtype: z.string().optional(),
        label: z.string().optional(),
        desc: z.string().optional(),
        os: z.string().optional(),
    }).passthrough().optional()
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized access detected. Session invalid." }, { status: 401 });
        }

        const rawBody = await req.json();
        const validation = SuggestVersionSchema.safeParse(rawBody);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: "Invalid payload schema." }, { status: 400 });
        }

        const { nodeData } = validation.data;
        const apiKey = process.env.GOOGLE_GENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ options: [] });
        }

        const ai = new GoogleGenAI({ apiKey });

        const componentContext = `Type: ${nodeData?.type || 'Unknown'}
Subtype: ${nodeData?.subtype || 'Unknown'}
Label: ${nodeData?.label || 'Unknown'}
Description: ${nodeData?.desc || 'Unknown'}
Base OS: ${nodeData?.os || 'Unknown'}`;

        const prompt = `You are a cybersecurity expert. Based on the following infrastructure component, provide exactly 5 realistic, specific software/OS/firmware versions (including patch levels, e.g., 'Apache 2.4.49', 'Cisco IOS 15.2', 'Windows Server 2012 R2') that might be running on it. Include versions known to have critical CVEs to make penetration testing simulations realistic.
        
Component Data:
${componentContext}

Return ONLY a raw JSON array of 5 strings. No markdown formatting, no backticks, no other text.
Example: ["Version 1", "Version 2", "Version 3", "Version 4", "Version 5"]`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
            }
        });

        const text = (response.text || '').trim();
        let options = [];
        try {
            options = JSON.parse(text);
        } catch (e) {
            options = JSON.parse(text.replace(/(^```json\s*|^```\s*|```$)/gm, '').trim());
        }

        return NextResponse.json({ options: Array.isArray(options) ? options : [] });
    } catch (error: any) {
        console.error("AI Version Suggestion Error:", error);
        return NextResponse.json({ options: [] }, { status: 500 });
    }
}
