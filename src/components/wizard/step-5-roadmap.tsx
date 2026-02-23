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
  AlertTriangle,
  Clock,
  Target,
  CheckCircle,
  ShieldAlert,
  Zap,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";

interface Phase {
  phaseName: string;
  duration: string;
  keyActivities: string[];
  deliverables: string[];
  risks: string[];
  successCriteria: string[];
}

interface RiskCategory {
  category: string;
  score: number;
  details: string;
  mitigations: string[];
}

interface RoadmapResult {
  phases: Phase[];
  totalTimeline: string;
  estimatedBudgetRange: string;
  criticalPath: string[];
  quickWins: string[];
  overallRiskScore: number;
  riskCategories: RiskCategory[];
  executiveSummary: string;
}

const PHASE_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-300", accent: "text-blue-700", bar: "bg-blue-400" },
  { bg: "bg-green-50", border: "border-green-300", accent: "text-green-700", bar: "bg-green-400" },
  { bg: "bg-amber-50", border: "border-amber-300", accent: "text-amber-700", bar: "bg-amber-400" },
  { bg: "bg-purple-50", border: "border-purple-300", accent: "text-purple-700", bar: "bg-purple-400" },
  { bg: "bg-rose-50", border: "border-rose-300", accent: "text-rose-700", bar: "bg-rose-400" },
];

function PhaseCard({
  phase,
  index,
  totalPhases,
}: {
  phase: Phase;
  index: number;
  totalPhases: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const colors = PHASE_COLORS[index % PHASE_COLORS.length];

  return (
    <Card className={`${colors.border}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-4">
          {/* Phase number bubble */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors.bar} text-sm font-bold text-white`}
          >
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-[#0A2540]">{phase.phaseName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              {phase.duration}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress indicator */}
          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: totalPhases }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-4 rounded-full ${i <= index ? colors.bar : "bg-gray-200"}`}
              />
            ))}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <CardContent className={`border-t ${colors.bg} space-y-4 pt-4`}>
          {/* Key Activities */}
          {phase.keyActivities.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <Target className="h-3.5 w-3.5" />
                Key Activities
              </h4>
              <ul className="space-y-1.5">
                {phase.keyActivities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${colors.bar}`} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deliverables */}
          {phase.deliverables.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <CheckCircle className="h-3.5 w-3.5" />
                Deliverables
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {phase.deliverables.map((d, i) => (
                  <Badge key={i} variant="outline" className="font-normal">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Risks */}
            {phase.risks.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                  Risks
                </h4>
                <ul className="space-y-1.5">
                  {phase.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Criteria */}
            {phase.successCriteria.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <Target className="h-3.5 w-3.5 text-green-500" />
                  Success Criteria
                </h4>
                <ul className="space-y-1.5">
                  {phase.successCriteria.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface Step5Props {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  onNext: () => void;
  onBack: () => void;
}

export function Step5Roadmap({
  assessment,
  assessmentId,
  onNext,
  onBack,
}: Step5Props) {
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const updateRoadmap = useMutation(api.assessments.updateRoadmap);

  const hasExisting = assessment.phases && assessment.phases.length > 0;

  const runGeneration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build compliance summary for context
      const complianceSummary = JSON.stringify({
        aiActRiskCategory: assessment.aiActRiskCategory,
        aiActObligations: assessment.aiActObligations,
        dpiaRequired: assessment.dpiaRequired,
        doraApplicable: assessment.doraApplicable,
        doraObligations: assessment.doraObligations,
        complianceGaps: assessment.complianceGaps,
        complianceScore: assessment.complianceScore,
      });

      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
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
          },
          complianceResult: complianceSummary,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Roadmap generation failed");
      }

      const data: RoadmapResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [assessment]);

  useEffect(() => {
    if (!hasExisting && !loading && !result) {
      runGeneration();
    }
  }, [hasExisting, loading, result, runGeneration]);

  const handleSaveAndContinue = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await updateRoadmap({
        id: assessmentId,
        phases: result.phases,
        totalTimeline: result.totalTimeline,
        estimatedBudgetRange: result.estimatedBudgetRange,
        overallRiskScore: result.overallRiskScore,
        riskCategories: result.riskCategories,
      });
      onNext();
    } catch {
      setError("Failed to save roadmap");
    } finally {
      setSaving(false);
    }
  };

  // Use result or reconstruct from saved data
  const data: RoadmapResult | null = result || (hasExisting
    ? {
        phases: assessment.phases as Phase[],
        totalTimeline: assessment.totalTimeline || "",
        estimatedBudgetRange: assessment.estimatedBudgetRange || "",
        criticalPath: [],
        quickWins: [],
        overallRiskScore: assessment.overallRiskScore || 50,
        riskCategories: (assessment.riskCategories as RiskCategory[]) || [],
        executiveSummary: "",
      }
    : null);

  // Loading
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#059669]" />
          <h3 className="mb-2 text-lg font-semibold text-[#0A2540]">
            Generating Implementation Roadmap...
          </h3>
          <p className="max-w-md text-center text-sm text-gray-500">
            Claude AI is creating a phased &quot;crawl, walk, run&quot;
            implementation plan tailored to your organization, compliance
            requirements, and AI maturity level.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            This typically takes 15-30 seconds
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (error && !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Generation Failed
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
              onClick={runGeneration}
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

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step 5: Implementation Roadmap</CardTitle>
              <CardDescription>
                Phased deployment plan for {assessment.useCaseTitle}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={runGeneration}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Regenerate
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      {data.executiveSummary && (
        <Card className="border-[#0A2540]/10 bg-[#0A2540]/[0.02]">
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {data.executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline + Budget + Risk overview cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-8 w-8 text-[#2563EB]" />
            <div>
              <p className="text-xs font-medium text-gray-500">Total Timeline</p>
              <p className="text-lg font-bold text-[#0A2540]">
                {data.totalTimeline}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <DollarSign className="h-8 w-8 text-[#059669]" />
            <div>
              <p className="text-xs font-medium text-gray-500">Est. Budget</p>
              <p className="text-lg font-bold text-[#0A2540]">
                {data.estimatedBudgetRange}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <ShieldAlert className="h-8 w-8 text-[#D97706]" />
            <div>
              <p className="text-xs font-medium text-gray-500">Risk Score</p>
              <p className="text-lg font-bold text-[#0A2540]">
                {data.overallRiskScore}/100
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Timeline Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-1">
            {data.phases.map((phase, i) => {
              const colors = PHASE_COLORS[i % PHASE_COLORS.length];
              return (
                <div key={i} className="flex-1">
                  <div className={`h-3 rounded-full ${colors.bar}`} />
                  <p className="mt-1.5 text-center text-xs font-medium text-gray-600 truncate">
                    {phase.phaseName}
                  </p>
                  <p className="text-center text-xs text-gray-400">
                    {phase.duration}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Phase Cards */}
      <div className="space-y-3">
        {data.phases.map((phase, i) => (
          <PhaseCard
            key={i}
            phase={phase}
            index={i}
            totalPhases={data.phases.length}
          />
        ))}
      </div>

      {/* Quick Wins + Critical Path */}
      {(data.quickWins.length > 0 || data.criticalPath.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.quickWins.length > 0 && (
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-green-700">
                  <Zap className="h-4 w-4" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.quickWins.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {data.criticalPath.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {data.criticalPath.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                        {i + 1}
                      </span>
                      {c}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Risk Categories */}
      {data.riskCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Risk Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.riskCategories.map((cat, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {cat.category}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        cat.score >= 70
                          ? "border-red-200 text-red-700"
                          : cat.score >= 40
                            ? "border-amber-200 text-amber-700"
                            : "border-green-200 text-green-700"
                      }
                    >
                      {cat.score}/100
                    </Badge>
                  </div>
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${
                        cat.score >= 70
                          ? "bg-red-400"
                          : cat.score >= 40
                            ? "bg-amber-400"
                            : "bg-green-400"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{cat.details}</p>
                  {cat.mitigations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500">
                        Mitigations:
                      </p>
                      <ul className="mt-1 space-y-1">
                        {cat.mitigations.map((m, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-1.5 text-xs text-gray-500"
                          >
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={hasExisting ? onNext : handleSaveAndContinue}
          disabled={saving || !data.phases.length}
          className="bg-[#0A2540] hover:bg-[#0A2540]/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Risk Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
