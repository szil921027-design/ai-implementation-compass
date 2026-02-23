import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildVendorEvalPrompt, AssessmentContext } from "@/lib/ai-prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJSON(text: string): string {
  // Try to extract JSON from markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  // Otherwise try to find a JSON object
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
          content: buildVendorEvalPrompt(body),
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonStr = extractJSON(rawText);
    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (!parsed.vendors || !Array.isArray(parsed.vendors)) {
      throw new Error("Invalid response structure: missing vendors array");
    }

    // Normalize vendor scores
    const vendors = parsed.vendors.map(
      (v: {
        vendorName?: string;
        overallScore?: number;
        securityScore?: number;
        complianceScore?: number;
        functionalityScore?: number;
        integrationScore?: number;
        costScore?: number;
        riskFlags?: string[];
        recommendation?: string;
      }) => ({
        vendorName: v.vendorName || "Unknown Vendor",
        overallScore: Math.min(100, Math.max(0, v.overallScore || 0)),
        securityScore: Math.min(100, Math.max(0, v.securityScore || 0)),
        complianceScore: Math.min(100, Math.max(0, v.complianceScore || 0)),
        functionalityScore: Math.min(100, Math.max(0, v.functionalityScore || 0)),
        integrationScore: Math.min(100, Math.max(0, v.integrationScore || 0)),
        costScore: Math.min(100, Math.max(0, v.costScore || 0)),
        riskFlags: Array.isArray(v.riskFlags) ? v.riskFlags : [],
        recommendation: v.recommendation || "",
      })
    );

    return NextResponse.json({
      vendors,
      topRecommendation: parsed.topRecommendation || "",
      reasoning: parsed.reasoning || "",
    });
  } catch (error) {
    console.error("Vendor eval API error:", error);
    const message = error instanceof Error ? error.message : "AI evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
