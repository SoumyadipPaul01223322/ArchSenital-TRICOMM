import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemInstructions = `You are an expert cloud security architect. The user will ask you to design an architecture (e.g. "Build me a 3-tier E-commerce app on AWS"). 
You must return only a valid JSON object matching this schema exactly. DO NOT include markdown formatting like \`\`\`json. Return only raw JSON.
{
  "nodes": [
    {
      "id": "node-1", // unique string ID
      "position": { "x": number, "y": number }, // Auto-layout logically with x,y coords
      "data": {
        "label": "Name of Component",
        "componentType": "internet|firewall|waf|lb|cdn|router|switch|server|vps|node|database|api|iam|siem|storage|serverless|k8s|cicd",
        "subtype": "Specific subtype (e.g. web_server)",
        "ipAddress": "10.0.0.x (optional)",
        "osFamily": "Linux/Windows (optional)",
        "encryptionAtRest": true,
        "tlsEnforced": true
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "animated": true 
    }
  ]
}

Available Component Types & Categories:
- internet: Internet/WAN
- cdn: Content Delivery Network
- firewall: Network Firewall (subtype: ngfw), waf (subtype: waf)
- router, switch: Networking 
- lb: Load Balancer
- server: App/Web/DB Server (subtype: web_server, app_server, db_server)
- vps: Virtual Private Server
- node: Laptop, Workstation, IoT
- database: Database Cluster (PostgreSQL, MongoDB)
- storage: Cloud Storage (S3, GCS)
- serverless: Serverless Function (Lambda, Cloud Run)
- k8s: Kubernetes Cluster
- cicd: CI/CD Pipeline (GitHub Actions)
- api: API Gateway/Microservice
- iam: Identity Provider (Okta, AD)
- siem: Security Info & Event Management (Wazuh)

Layout guidance (Crucial): Provide well-spaced (x,y) coordinates. 
Example positioning: 
Internet (0,0) -> WAF/CDN (250, 0) -> Load Balancer (500, 0) -> App Servers (750, -150) and (750, 150) -> Database Cluster (1000, 0).
Include helpful configurations inside "data" like "tlsEnforced": true, "encryptionAtRest": true, where relevant to show secure defaults.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Perplexity API Error: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";

    // Ensure we extract pure JSON
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const jsonString = match ? match[0] : text;

    const architecture = JSON.parse(jsonString);

    return NextResponse.json({ success: true, architecture });
  } catch (error: any) {
    console.error('AI Architecture Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
