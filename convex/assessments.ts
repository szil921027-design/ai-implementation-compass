import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("assessments", {
      userId: args.userId,
      status: "draft",
      currentStep: 1,
    });
    return id;
  },
});

export const getAll = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateStep1 = mutation({
  args: {
    id: v.id("assessments"),
    orgName: v.string(),
    industry: v.union(
      v.literal("fintech"),
      v.literal("banking"),
      v.literal("insurance"),
      v.literal("healthcare"),
      v.literal("retail"),
      v.literal("manufacturing"),
      v.literal("public_sector"),
      v.literal("other")
    ),
    orgSize: v.union(
      v.literal("startup"),
      v.literal("scaleup"),
      v.literal("mid_market"),
      v.literal("enterprise")
    ),
    employeeCount: v.number(),
    regulatoryFrameworks: v.array(v.string()),
    jurisdiction: v.array(v.string()),
    existingAIMaturity: v.union(
      v.literal("none"),
      v.literal("exploring"),
      v.literal("piloting"),
      v.literal("scaling"),
      v.literal("optimizing")
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      ...data,
      status: "in_progress",
      currentStep: 2,
    });
  },
});

export const updateStep2 = mutation({
  args: {
    id: v.id("assessments"),
    useCaseTitle: v.string(),
    useCaseDescription: v.string(),
    useCaseCategory: v.union(
      v.literal("customer_service"),
      v.literal("compliance_automation"),
      v.literal("document_processing"),
      v.literal("fraud_detection"),
      v.literal("internal_search"),
      v.literal("code_generation"),
      v.literal("data_analysis"),
      v.literal("other")
    ),
    dataTypes: v.array(v.string()),
    dataVolume: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    currentProcess: v.string(),
    expectedOutcome: v.string(),
    estimatedUsers: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      ...data,
      currentStep: 3,
    });
  },
});

export const updateVendorScores = mutation({
  args: {
    id: v.id("assessments"),
    vendorScores: v.array(
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
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      vendorScores: args.vendorScores,
      currentStep: 4,
    });
  },
});

export const updateCompliance = mutation({
  args: {
    id: v.id("assessments"),
    aiActRiskCategory: v.union(
      v.literal("prohibited"),
      v.literal("high_risk"),
      v.literal("limited_risk"),
      v.literal("minimal_risk")
    ),
    aiActObligations: v.array(v.string()),
    dpiaRequired: v.boolean(),
    dpiaTriggeredCriteria: v.array(v.string()),
    doraApplicable: v.boolean(),
    doraObligations: v.array(v.string()),
    complianceGaps: v.array(v.string()),
    complianceScore: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      ...data,
      currentStep: 5,
    });
  },
});

export const updateRoadmap = mutation({
  args: {
    id: v.id("assessments"),
    phases: v.array(
      v.object({
        phaseName: v.string(),
        duration: v.string(),
        keyActivities: v.array(v.string()),
        deliverables: v.array(v.string()),
        risks: v.array(v.string()),
        successCriteria: v.array(v.string()),
      })
    ),
    totalTimeline: v.string(),
    estimatedBudgetRange: v.string(),
    overallRiskScore: v.number(),
    riskCategories: v.array(
      v.object({
        category: v.string(),
        score: v.number(),
        details: v.string(),
        mitigations: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      ...data,
      currentStep: 6,
    });
  },
});

export const complete = mutation({
  args: {
    id: v.id("assessments"),
    fullReport: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      fullReport: args.fullReport,
      currentStep: 7,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
