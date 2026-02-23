import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildRoadmapPrompt, AssessmentContext } from "@/lib/ai-prompts";
import { checkRateLimit } from "@/lib/rate-limit";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text;
}

/** Try to repair truncated JSON by closing open brackets/braces */
function repairJSON(text: string): string {
  try {
    JSON.parse(text);
    return text;
  } catch {
    // Count unmatched openers
    let braces = 0;
    let brackets = 0;
    let inString = false;
    let escape = false;
    for (const ch of text) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") braces++;
      else if (ch === "}") braces--;
      else if (ch === "[") brackets++;
      else if (ch === "]") brackets--;
    }
    // If we're inside a string, close it
    if (inString) text += '"';
    // Close all open brackets/braces in reverse order
    // Rebuild the closing sequence based on what's still open
    let repaired = text;
    // Trim trailing comma or colon for cleaner closure
    repaired = repaired.replace(/[,:\s]+$/, "");
    for (let i = 0; i < brackets; i++) repaired += "]";
    for (let i = 0; i < braces; i++) repaired += "}";
    return repaired;
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limited = checkRateLimit(`roadmap:${ip}`);
  if (limited) return limited;

  try {
    const body: { context: AssessmentContext; complianceResult: string } =
      await request.json();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildRoadmapPrompt(body.context, body.complianceResult),
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonStr = extractJSON(rawText);

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Attempt to repair truncated JSON
      const repaired = repairJSON(jsonStr);
      parsed = JSON.parse(repaired);
    }

    // Normalize phases
    const phases = Array.isArray(parsed.phases)
      ? parsed.phases.map(
          (p: {
            phaseName?: string;
            duration?: string;
            keyActivities?: string[];
            deliverables?: string[];
            risks?: string[];
            successCriteria?: string[];
          }) => ({
            phaseName: p.phaseName || "Unnamed Phase",
            duration: p.duration || "TBD",
            keyActivities: Array.isArray(p.keyActivities) ? p.keyActivities : [],
            deliverables: Array.isArray(p.deliverables) ? p.deliverables : [],
            risks: Array.isArray(p.risks) ? p.risks : [],
            successCriteria: Array.isArray(p.successCriteria) ? p.successCriteria : [],
          })
        )
      : [];

    // Normalize risk categories
    const riskSummary = parsed.riskSummary || {};
    const riskCategories = Array.isArray(riskSummary.categories)
      ? riskSummary.categories.map(
          (c: {
            category?: string;
            score?: number;
            details?: string;
            mitigations?: string[];
          }) => ({
            category: c.category || "General",
            score: Math.min(100, Math.max(0, c.score || 50)),
            details: c.details || "",
            mitigations: Array.isArray(c.mitigations) ? c.mitigations : [],
          })
        )
      : [];

    return NextResponse.json({
      phases,
      totalTimeline: parsed.totalTimeline || "24-36 months",
      estimatedBudgetRange: parsed.estimatedBudgetRange || "Varies",
      criticalPath: Array.isArray(parsed.criticalPath) ? parsed.criticalPath : [],
      quickWins: Array.isArray(parsed.quickWins) ? parsed.quickWins : [],
      overallRiskScore: Math.min(
        100,
        Math.max(0, riskSummary.overallScore || 50)
      ),
      riskCategories,
      executiveSummary: parsed.executiveSummary || "",
    });
  } catch (error) {
    console.error("Roadmap API error:", error);
    const message = error instanceof Error ? error.message : "Roadmap generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
