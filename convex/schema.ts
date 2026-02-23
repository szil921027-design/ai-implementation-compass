import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
    // Identifiers
    userId: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("completed")
    ),

    // Step 1: Organization Profile
    orgName: v.optional(v.string()),
    industry: v.optional(
      v.union(
        v.literal("fintech"),
        v.literal("banking"),
        v.literal("insurance"),
        v.literal("healthcare"),
        v.literal("retail"),
        v.literal("manufacturing"),
        v.literal("public_sector"),
        v.literal("other")
      )
    ),
    orgSize: v.optional(
      v.union(
        v.literal("startup"),
        v.literal("scaleup"),
        v.literal("mid_market"),
        v.literal("enterprise")
      )
    ),
    employeeCount: v.optional(v.number()),
    regulatoryFrameworks: v.optional(v.array(v.string())),
    jurisdiction: v.optional(v.array(v.string())),
    existingAIMaturity: v.optional(
      v.union(
        v.literal("none"),
        v.literal("exploring"),
        v.literal("piloting"),
        v.literal("scaling"),
        v.literal("optimizing")
      )
    ),

    // Step 2: AI Use Case
    useCaseTitle: v.optional(v.string()),
    useCaseDescription: v.optional(v.string()),
    useCaseCategory: v.optional(
      v.union(
        v.literal("customer_service"),
        v.literal("compliance_automation"),
        v.literal("document_processing"),
        v.literal("fraud_detection"),
        v.literal("internal_search"),
        v.literal("code_generation"),
        v.literal("data_analysis"),
        v.literal("other")
      )
    ),
    dataTypes: v.optional(v.array(v.string())),
    dataVolume: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    currentProcess: v.optional(v.string()),
    expectedOutcome: v.optional(v.string()),
    estimatedUsers: v.optional(v.number()),

    // Step 3: Vendor Evaluation (AI-generated)
    vendorScores: v.optional(
      v.array(
        v.object({
          vendorName: v.string(),
          overallScore: v.number(),
          securityScore: v.number(),
          complianceScore: v.number(),
          functionalityScore: v.number(),
          integrationScore: v.number(),
          costScore: v.number(),
          riskFlags: v.array(v.string()),
          recommendation: v.string(),
        })
      )
    ),

    // Step 4: Compliance Assessment (AI-generated)
    aiActRiskCategory: v.optional(
      v.union(
        v.literal("prohibited"),
        v.literal("high_risk"),
        v.literal("limited_risk"),
        v.literal("minimal_risk")
      )
    ),
    aiActObligations: v.optional(v.array(v.string())),
    dpiaRequired: v.optional(v.boolean()),
    dpiaTriggeredCriteria: v.optional(v.array(v.string())),
    doraApplicable: v.optional(v.boolean()),
    doraObligations: v.optional(v.array(v.string())),
    complianceGaps: v.optional(v.array(v.string())),
    complianceScore: v.optional(v.number()),

    // Step 5: Implementation Roadmap (AI-generated)
    phases: v.optional(
      v.array(
        v.object({
          phaseName: v.string(),
          duration: v.string(),
          keyActivities: v.array(v.string()),
          deliverables: v.array(v.string()),
          risks: v.array(v.string()),
          successCriteria: v.array(v.string()),
        })
      )
    ),
    totalTimeline: v.optional(v.string()),
    estimatedBudgetRange: v.optional(v.string()),

    // Step 6: Risk Dashboard (AI-generated)
    overallRiskScore: v.optional(v.number()),
    riskCategories: v.optional(
      v.array(
        v.object({
          category: v.string(),
          score: v.number(),
          details: v.string(),
          mitigations: v.array(v.string()),
        })
      )
    ),

    // Step 7: Full report
    fullReport: v.optional(v.string()),

    // Current wizard step
    currentStep: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),
});
