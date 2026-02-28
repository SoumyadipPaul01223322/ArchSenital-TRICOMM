import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ArchSentinel Enterprise Core Tables

  organizations: defineTable({
    name: v.string(),
    subscriptionTier: v.union(
      v.literal("Starter"),
      v.literal("Business"),
      v.literal("Enterprise")
    ),
  }),

  users: defineTable({
    orgId: v.string(),
    auth0Id: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("Developer"),
      v.literal("Security"),
      v.literal("Admin"),
      v.literal("Executive")
    ),
  })
    .index("by_orgId", ["orgId"])
    .index("by_auth0Id", ["auth0Id"]),

  projects: defineTable({
    orgId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    riskScore: v.number(),
    lastScan: v.optional(v.number()), // Timestamp
  }).index("by_orgId", ["orgId"]),

  diagrams: defineTable({
    projectId: v.id("projects"),
    orgId: v.string(), // Denormalized for strict multi-tenant filtering
    nodes: v.array(
      v.object({
        id: v.string(),
        type: v.optional(v.string()),
        position: v.object({ x: v.number(), y: v.number() }),
        data: v.any(), // Flexible component data configurations
        measured: v.optional(v.any()),
        style: v.optional(v.any()),
        selected: v.optional(v.boolean()),
        dragging: v.optional(v.boolean()),
        positionAbsolute: v.optional(v.any()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
      })
    ),
    edges: v.array(
      v.object({
        id: v.string(),
        source: v.string(),
        target: v.string(),
        data: v.optional(v.any()), // e.g. { encrypted: boolean }
        animated: v.optional(v.boolean()),
        style: v.optional(v.any()),
        selected: v.optional(v.boolean()),
        sourceHandle: v.optional(v.any()),
        targetHandle: v.optional(v.any()),
        type: v.optional(v.string())
      })
    ),
    riskScore: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_orgId", ["orgId"]),

  riskReports: defineTable({
    projectId: v.id("projects"),
    diagramId: v.id("diagrams"),
    orgId: v.string(),
    totalRiskScore: v.number(),
    classification: v.union(
      v.literal("Low"),
      v.literal("Moderate"),
      v.literal("High"),
      v.literal("Critical")
    ),
    impactScore: v.number(),
    findings: v.array(
      v.object({
        componentId: v.optional(v.string()), // Sometimes finding applies to a connection
        description: v.string(),
        severity: v.union(
          v.literal("Low"),
          v.literal("Medium"),
          v.literal("High"),
          v.literal("Critical")
        ),
        complianceMappings: v.array(v.string()), // e.g., ["OWASP A01", "SOC2 CC6.1"]
      })
    ),
    aiSummary: v.optional(v.string()), // Generated via Gemini
    createdAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_orgId", ["orgId"]),

  architectures: defineTable({
    name: v.string(),
    ownerId: v.string(),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
    viewport: v.object({ x: v.number(), y: v.number(), zoom: v.number() }),
    updatedAt: v.number(),
  }).index("by_ownerId", ["ownerId"]),

  // Entity Settings
  orgSettings: defineTable({
    orgId: v.string(),
    auditLogging: v.boolean(),
    ipAllowlisting: v.boolean(),
    apiKeyRotationDays: v.number(),
    alertCriticalFindings: v.boolean(),
    alertWeeklyDigest: v.boolean(),
    alertScanCompletion: v.boolean(),
  }).index("by_orgId", ["orgId"]),

  // API Keys / CI/CD Access Tokens
  apiKeys: defineTable({
    orgId: v.string(),
    name: v.string(),
    key: v.string(),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("developer"),
      v.literal("readonly"),
      v.literal("ci_runner")
    )),
    createdAt: v.number(),
    lastUsed: v.optional(v.number()),
  }).index("by_orgId", ["orgId"]),

  // Simulation History / Attack Logs
  simulationRuns: defineTable({
    orgId: v.string(),
    architectureName: v.string(),
    initialRiskScore: v.number(),
    finalRiskScore: v.number(),
    findingCount: v.number(),
    remediationsApplied: v.number(),
    status: v.union(v.literal("Completed"), v.literal("Failed"), v.literal("Interrupted")),
    runDurationMs: v.number(),
    createdAt: v.number(),
  }).index("by_orgId", ["orgId"]),
});


