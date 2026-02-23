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
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ComplianceResult {
  aiActClassification: {
    riskCategory: string;
    reasoning: string;
    obligations: string[];
    deadline: string;
  };
  dpiaAssessment: {
    required: boolean;
    triggeredCriteria: string[];
    criteriaMet: number;
    dpiaRoadmap: string[];
  };
  doraAssessment: {
    applicable: boolean;
    reasoning: string;
    obligations: string[];
    contractRequirements: string[];
  };
  gaps: string[];
  complianceScore: number;
  criticalActions: string[];
}

const RISK_CONFIG = {
  prohibited: {
    label: "PROHIBITED",
    icon: ShieldX,
    color: "bg-red-100 text-red-800 border-red-300",
    cardBorder: "border-red-500",
    description: "This AI use case is prohibited under the EU AI Act.",
  },
  high_risk: {
    label: "HIGH RISK",
    icon: ShieldAlert,
    color: "bg-red-50 text-red-700 border-red-200",
    cardBorder: "border-amber-400",
    description:
      "Significant regulatory obligations apply. Full compliance documentation required by Aug 2026.",
  },
  limited_risk: {
    label: "LIMITED RISK",
    icon: Shield,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    cardBorder: "border-blue-300",
    description: "Transparency obligations apply. Users must be informed they are interacting with AI.",
  },
  minimal_risk: {
    label: "MINIMAL RISK",
    icon: ShieldCheck,
    color: "bg-green-50 text-green-700 border-green-200",
    cardBorder: "border-green-300",
    description: "Voluntary codes of conduct recommended. Minimal regulatory burden.",
  },
};

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-gray-50"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open && <div className="border-t px-4 py-3">{children}</div>}
    </div>
  );
}

interface Step4Props {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Compliance({
  assessment,
  assessmentId,
  onNext,
  onBack,
}: Step4Props) {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const updateCompliance = useMutation(api.assessments.updateCompliance);

  const hasExisting = assessment.aiActRiskCategory != null;

  const runAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/compliance", {
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
        throw new Error(err.error || "Compliance assessment failed");
      }

      const data: ComplianceResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [assessment]);

  useEffect(() => {
    if (!hasExisting && !loading && !result) {
      runAssessment();
    }
  }, [hasExisting, loading, result, runAssessment]);

  const handleSaveAndContinue = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await updateCompliance({
        id: assessmentId,
        aiActRiskCategory: result.aiActClassification.riskCategory as
          | "prohibited"
          | "high_risk"
          | "limited_risk"
          | "minimal_risk",
        aiActObligations: result.aiActClassification.obligations,
        dpiaRequired: result.dpiaAssessment.required,
        dpiaTriggeredCriteria: result.dpiaAssessment.triggeredCriteria,
        doraApplicable: result.doraAssessment.applicable,
        doraObligations: result.doraAssessment.obligations,
        complianceGaps: result.gaps,
        complianceScore: result.complianceScore,
      });
      onNext();
    } catch {
      setError("Failed to save compliance data");
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#2563EB]" />
          <h3 className="mb-2 text-lg font-semibold text-[#0A2540]">
            Running Compliance Assessment...
          </h3>
          <p className="max-w-md text-center text-sm text-gray-500">
            Analyzing EU AI Act risk classification, GDPR DPIA requirements, and
            DORA applicability for your use case.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            This typically takes 15-25 seconds
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (error && !result && !hasExisting) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Assessment Failed
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
              onClick={runAssessment}
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

  // Use result or reconstruct from saved assessment
  const data: ComplianceResult = result || {
    aiActClassification: {
      riskCategory: assessment.aiActRiskCategory || "minimal_risk",
      reasoning: "",
      obligations: assessment.aiActObligations || [],
      deadline: "2 August 2026",
    },
    dpiaAssessment: {
      required: assessment.dpiaRequired ?? false,
      triggeredCriteria: assessment.dpiaTriggeredCriteria || [],
      criteriaMet: assessment.dpiaTriggeredCriteria?.length || 0,
      dpiaRoadmap: [],
    },
    doraAssessment: {
      applicable: assessment.doraApplicable ?? false,
      reasoning: "",
      obligations: assessment.doraObligations || [],
      contractRequirements: [],
    },
    gaps: assessment.complianceGaps || [],
    complianceScore: assessment.complianceScore || 0,
    criticalActions: [],
  };

  const riskConfig =
    RISK_CONFIG[data.aiActClassification.riskCategory as keyof typeof RISK_CONFIG] ||
    RISK_CONFIG.minimal_risk;
  const RiskIcon = riskConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step 4: Compliance Assessment</CardTitle>
              <CardDescription>
                Regulatory analysis for {assessment.useCaseTitle}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={runAssessment}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Re-assess
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Compliance Score + Risk Category */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* EU AI Act Classification */}
        <Card className={riskConfig.cardBorder}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <RiskIcon className="h-5 w-5" />
              EU AI Act Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Badge className={`text-sm ${riskConfig.color}`}>
                {riskConfig.label}
              </Badge>
            </div>
            <p className="mb-3 text-sm text-gray-600">
              {riskConfig.description}
            </p>
            {data.aiActClassification.reasoning && (
              <p className="text-sm italic text-gray-500">
                {data.aiActClassification.reasoning}
              </p>
            )}
            <div className="mt-3 text-xs font-medium text-gray-500">
              Deadline: {data.aiActClassification.deadline}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Compliance Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <div
              className={`relative flex h-28 w-28 items-center justify-center rounded-full border-8 ${
                data.complianceScore >= 70
                  ? "border-green-400"
                  : data.complianceScore >= 40
                    ? "border-amber-400"
                    : "border-red-400"
              }`}
            >
              <span className="font-mono text-3xl font-bold text-[#0A2540]">
                {data.complianceScore}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {data.complianceScore >= 70
                ? "Good compliance posture"
                : data.complianceScore >= 40
                  ? "Moderate gaps identified"
                  : "Significant work required"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DPIA Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {data.dpiaAssessment.required ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            GDPR Data Protection Impact Assessment (DPIA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Badge
              className={
                data.dpiaAssessment.required
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-green-100 text-green-700 border-green-200"
              }
            >
              {data.dpiaAssessment.required ? "DPIA REQUIRED" : "DPIA NOT REQUIRED"}
            </Badge>
            <span className="ml-3 text-sm text-gray-500">
              {data.dpiaAssessment.criteriaMet} of 9 EDPB criteria triggered
            </span>
          </div>

          {data.dpiaAssessment.triggeredCriteria.length > 0 && (
            <CollapsibleSection
              title={`Triggered Criteria (${data.dpiaAssessment.triggeredCriteria.length})`}
              defaultOpen
            >
              <ul className="space-y-2">
                {data.dpiaAssessment.triggeredCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {data.dpiaAssessment.dpiaRoadmap.length > 0 && (
            <div className="mt-3">
              <CollapsibleSection title="DPIA Roadmap (6 Phases)">
                <ol className="space-y-2">
                  {data.dpiaAssessment.dpiaRoadmap.map((phase, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {phase}
                    </li>
                  ))}
                </ol>
              </CollapsibleSection>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DORA Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {data.doraAssessment.applicable ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            DORA (Digital Operational Resilience Act)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            className={
              data.doraAssessment.applicable
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-green-100 text-green-700 border-green-200"
            }
          >
            {data.doraAssessment.applicable ? "DORA APPLIES" : "DORA NOT APPLICABLE"}
          </Badge>
          {data.doraAssessment.reasoning && (
            <p className="mt-2 text-sm text-gray-600">
              {data.doraAssessment.reasoning}
            </p>
          )}

          {data.doraAssessment.obligations.length > 0 && (
            <div className="mt-3">
              <CollapsibleSection
                title={`Obligations (${data.doraAssessment.obligations.length})`}
              >
                <ul className="space-y-2">
                  {data.doraAssessment.obligations.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      {o}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            </div>
          )}

          {data.doraAssessment.contractRequirements.length > 0 && (
            <div className="mt-3">
              <CollapsibleSection title="Contract Requirements (Art. 30)">
                <ul className="space-y-2">
                  {data.doraAssessment.contractRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Gaps */}
      {data.gaps.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Compliance Gaps ({data.gaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Critical Actions */}
      {data.criticalActions.length > 0 && (
        <Card className="border-[#0A2540]/20 bg-[#0A2540]/[0.02]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Critical Actions (Priority Order)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {data.criticalActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
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
          disabled={saving}
          className="bg-[#0A2540] hover:bg-[#0A2540]/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Implementation Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
