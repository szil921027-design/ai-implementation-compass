"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  Shield,
  FileCheck,
  Cpu,
  Link2,
  DollarSign,
  AlertTriangle,
  Trophy,
} from "lucide-react";

interface VendorScore {
  vendorName: string;
  overallScore: number;
  securityScore: number;
  complianceScore: number;
  functionalityScore: number;
  integrationScore: number;
  costScore: number;
  riskFlags: string[];
  recommendation: string;
}

interface VendorResult {
  vendors: VendorScore[];
  topRecommendation: string;
  reasoning: string;
}

const SCORE_DIMENSIONS = [
  { key: "securityScore" as const, label: "Security", icon: Shield, color: "#0A2540" },
  { key: "complianceScore" as const, label: "Compliance", icon: FileCheck, color: "#2563EB" },
  { key: "functionalityScore" as const, label: "Functionality", icon: Cpu, color: "#059669" },
  { key: "integrationScore" as const, label: "Integration", icon: Link2, color: "#D97706" },
  { key: "costScore" as const, label: "Cost Efficiency", icon: DollarSign, color: "#7C3AED" },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right font-mono text-xs font-semibold">
        {score}
      </span>
    </div>
  );
}

function getRiskFlagColor(flag: string): string {
  const lower = flag.toLowerCase();
  if (lower.includes("red") || lower.includes("critical") || lower.includes("high risk"))
    return "text-red-700 bg-red-50 border-red-200";
  if (lower.includes("amber") || lower.includes("warning") || lower.includes("medium"))
    return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-green-700 bg-green-50 border-green-200";
}

interface Step3Props {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Vendors({
  assessment,
  assessmentId,
  onNext,
  onBack,
}: Step3Props) {
  const [result, setResult] = useState<VendorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const updateVendorScores = useMutation(api.assessments.updateVendorScores);

  const hasExistingScores =
    assessment.vendorScores && assessment.vendorScores.length > 0;

  const runEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/vendor-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: assessment.orgName,
          industry: assessment.industry,
          orgSize: assessment.orgSize,
          employeeCount: assessment.employeeCount,
          regulatoryFrameworks: assessment.regulatoryFrameworks,
          jurisdiction: assessment.jurisdiction,
          existingAIMaturity: assessment.existingAIMaturity,
          useCaseTitle: assessment.useCaseTitle,
          useCaseDescription: assessment.useCaseDescription,
          useCaseCategory: assessment.useCaseCategory,
          dataTypes: assessment.dataTypes,
          dataVolume: assessment.dataVolume,
          currentProcess: assessment.currentProcess,
          expectedOutcome: assessment.expectedOutcome,
          estimatedUsers: assessment.estimatedUsers,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to evaluate vendors");
      }

      const data: VendorResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [assessment]);

  useEffect(() => {
    if (!hasExistingScores && !loading && !result) {
      runEvaluation();
    }
  }, [hasExistingScores, loading, result, runEvaluation]);

  const handleSaveAndContinue = async () => {
    const vendors = result?.vendors || [];
    if (vendors.length === 0) return;
    setSaving(true);
    try {
      await updateVendorScores({
        id: assessmentId,
        vendorScores: vendors,
      });
      onNext();
    } catch {
      setError("Failed to save vendor scores");
    } finally {
      setSaving(false);
    }
  };

  // Show existing scores if available and no new result
  const displayVendors: VendorScore[] =
    result?.vendors ||
    (hasExistingScores
      ? (assessment.vendorScores as VendorScore[])
      : []);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#0A2540]" />
          <h3 className="mb-2 text-lg font-semibold text-[#0A2540]">
            Evaluating AI Vendors...
          </h3>
          <p className="max-w-md text-center text-sm text-gray-500">
            Claude AI is analyzing your organization profile and use case to
            score the most relevant enterprise AI vendors across security,
            compliance, functionality, integration, and cost dimensions.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            This typically takes 10-20 seconds
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && displayVendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Evaluation Failed
          </h3>
          <p className="mb-6 max-w-md text-center text-sm text-gray-500">
            {error}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={runEvaluation}
              className="bg-[#0A2540] hover:bg-[#0A2540]/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step 3: AI Vendor Evaluation</CardTitle>
              <CardDescription>
                {displayVendors.length} vendors evaluated based on your
                requirements
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={runEvaluation}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Re-evaluate
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Top Recommendation */}
      {(result?.topRecommendation || result?.reasoning) && (
        <Card className="border-[#9FE870]/50 bg-[#9FE870]/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-[#059669]" />
            <div>
              <p className="font-semibold text-[#0A2540]">
                {result.topRecommendation}
              </p>
              <p className="mt-1 text-sm text-gray-600">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {displayVendors.map((vendor, idx) => (
          <Card
            key={vendor.vendorName}
            className={idx === 0 ? "border-[#9FE870] ring-1 ring-[#9FE870]/30" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <Badge className="bg-[#9FE870] text-[#0A2540]">
                      Top Pick
                    </Badge>
                  )}
                  <CardTitle className="text-base">
                    {vendor.vendorName}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540]">
                  <span className="font-mono text-lg font-bold text-white">
                    {vendor.overallScore}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score bars */}
              <div className="space-y-2">
                {SCORE_DIMENSIONS.map((dim) => (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <dim.icon className="h-3 w-3" />
                      {dim.label}
                    </div>
                    <ScoreBar score={vendor[dim.key]} color={dim.color} />
                  </div>
                ))}
              </div>

              {/* Risk Flags */}
              {vendor.riskFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {vendor.riskFlags.map((flag, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${getRiskFlagColor(flag)}`}
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}

              {/* Recommendation */}
              <p className="text-sm leading-relaxed text-gray-600">
                {vendor.recommendation}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={hasExistingScores ? onNext : handleSaveAndContinue}
          disabled={saving || displayVendors.length === 0}
          className="bg-[#0A2540] hover:bg-[#0A2540]/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Compliance Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
