import {
    Route53Client,
    ListHostedZonesCommand,
    ListResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Initialize client using provided AWS credentials in env
        const client = new Route53Client({
            region: process.env.AWS_REGION || "us-east-1",
            // Credentials will automatically be picked up from:
            // process.env.AWS_ACCESS_KEY_ID
            // process.env.AWS_SECRET_ACCESS_KEY
        });

        // Step 1: Get Hosted Zones
        let zones: any[] = [];
        let fetchedDnsData: any[] = [];

        try {
            const zonesResponse = await client.send(new ListHostedZonesCommand({}));
            zones = zonesResponse.HostedZones || [];

            for (const zone of zones) {
                const recordsResponse = await client.send(
                    new ListResourceRecordSetsCommand({
                        HostedZoneId: zone.Id,
                    })
                );

                const records = recordsResponse.ResourceRecordSets || [];

                fetchedDnsData.push({
                    zoneName: zone.Name,
                    zoneId: zone.Id,
                    records: records.map((record) => ({
                        name: record.Name,
                        type: record.Type,
                        ttl: record.TTL,
                        values: record.ResourceRecords?.map((r) => r.Value) || [],
                        aliasTarget: record.AliasTarget ? record.AliasTarget.DNSName : null,
                    })),
                });
            }
        } catch (awsError) {
            console.warn("AWS Route 53 SDK Error. Falling back to mock data for Hackathon Demo.", awsError);
        }

        // Provide high-quality mock data for the demo if creds fail OR if no real zones are found
        if (fetchedDnsData.length === 0) {
            fetchedDnsData = [
                {
                    zoneName: "demo-corp.internal",
                    zoneId: "Z0123456789ABCDEF",
                    records: [
                        { name: "api.demo-corp.internal.", type: "A", ttl: 30, values: ["52.204.1.18"], aliasTarget: null },
                        { name: "payment-gateway.demo-corp.internal.", type: "CNAME", ttl: 60, values: ["internal-alb-xyz.us-east-1.elb.amazonaws.com"], aliasTarget: null },
                        { name: "legacy-db.demo-corp.internal.", type: "A", ttl: 300, values: ["10.0.4.55"], aliasTarget: null }
                    ]
                }
            ];
        }

        return NextResponse.json({
            success: true,
            dnsData: fetchedDnsData,
        });

    } catch (error: any) {
        console.error("DNS Ingestion Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                hint: "Ensure your IAM policy includes 'route53:ListHostedZones' and 'route53:ListResourceRecordSets' permissions.",
            },
            { status: 500 }
        );
    }
}
