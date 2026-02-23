import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildCompliancePrompt, AssessmentContext } from "@/lib/ai-prompts";

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

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentContext = await request.json();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildCompliancePrompt(body),
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonStr = extractJSON(rawText);
    const parsed = JSON.parse(jsonStr);

    // Normalize and validate
    const aiAct = parsed.aiActClassification || {};
    const dpia = parsed.dpiaAssessment || {};
    const dora = parsed.doraAssessment || {};

    const riskCategory = ["prohibited", "high_risk", "limited_risk", "minimal_risk"].includes(
      aiAct.riskCategory
    )
      ? aiAct.riskCategory
      : "limited_risk";

    return NextResponse.json({
      aiActClassification: {
        riskCategory,
        reasoning: aiAct.reasoning || "",
        obligations: Array.isArray(aiAct.obligations) ? aiAct.obligations : [],
        deadline: aiAct.deadline || "2 August 2026",
      },
      dpiaAssessment: {
        required: dpia.required ?? true,
        triggeredCriteria: Array.isArray(dpia.triggeredCriteria) ? dpia.triggeredCriteria : [],
        criteriaMet: typeof dpia.criteriaMet === "number" ? dpia.criteriaMet : 0,
        dpiaRoadmap: Array.isArray(dpia.dpiaRoadmap) ? dpia.dpiaRoadmap : [],
      },
      doraAssessment: {
        applicable: dora.applicable ?? false,
        reasoning: dora.reasoning || "",
        obligations: Array.isArray(dora.obligations) ? dora.obligations : [],
        contractRequirements: Array.isArray(dora.contractRequirements) ? dora.contractRequirements : [],
      },
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      complianceScore: Math.min(100, Math.max(0, parsed.complianceScore || 50)),
      criticalActions: Array.isArray(parsed.criticalActions) ? parsed.criticalActions : [],
    });
  } catch (error) {
    console.error("Compliance API error:", error);
    const message = error instanceof Error ? error.message : "Compliance assessment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
