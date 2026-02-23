"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Loader2,
  CheckCircle,
  Building2,
  Cpu,
  Shield,
  FileText,
  BarChart3,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Step7Props {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  onBack: () => void;
}

export function Step7Export({ assessment, assessmentId, onBack }: Step7Props) {
  const [downloading, setDownloading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const completeAssessment = useMutation(api.assessments.complete);
  const router = useRouter();

  const isCompleted = assessment.status === "completed";

  const vendors = (assessment.vendorScores || []) as Array<{
    vendorName: string;
    overallScore: number;
    recommendation: string;
  }>;

  const phases = (assessment.phases || []) as Array<{
    phaseName: string;
    duration: string;
  }>;

  const riskCategories = (assessment.riskCategories || []) as Array<{
    category: string;
    score: number;
    details: string;
  }>;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeAssessment({ id: assessmentId });
    } catch {
      // silently handle — assessment may already be completed
    } finally {
      setCompleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Ensure completed first
      if (!isCompleted) {
        await completeAssessment({ id: assessmentId });
      }

      const res = await fetch(`/api/pdf/${assessmentId}`);
      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AI_Assessment_${assessment.orgName || "Report"}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleViewDashboard = async () => {
    if (!isCompleted) {
      await completeAssessment({ id: assessmentId });
    }
    router.push(`/assessment/${assessmentId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 7: Review & Export</CardTitle>
          <CardDescription>
            Review your complete assessment and download the PDF report.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Executive Summary Card */}
      <Card className="border-[#0A2540]/20 bg-gradient-to-br from-[#0A2540]/[0.02] to-white">
        <CardHeader>
          <CardTitle className="text-lg">
            AI Implementation Assessment Report
          </CardTitle>
          <CardDescription>
            {assessment.orgName} — {assessment.useCaseTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section 1: Organization */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0A2540]">
              <Building2 className="h-4 w-4" />
              Organization Context
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div>
                <span className="text-gray-500">Organization:</span>{" "}
                <span className="font-medium">{assessment.orgName}</span>
              </div>
              <div>
                <span className="text-gray-500">Industry:</span>{" "}
                <span className="font-medium capitalize">{assessment.industry}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>{" "}
                <span className="font-medium capitalize">
                  {assessment.orgSize?.replace("_", " ")} ({assessment.employeeCount} employees)
                </span>
              </div>
              <div>
                <span className="text-gray-500">AI Maturity:</span>{" "}
                <span className="font-medium capitalize">{assessment.existingAIMaturity}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Frameworks:</span>{" "}
                <span className="font-medium">
                  {assessment.regulatoryFrameworks?.join(", ")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 2: Use Case */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0A2540]">
              <Cpu className="h-4 w-4" />
              AI Use Case
            </h3>
            <p className="mb-1 text-sm font-medium">{assessment.useCaseTitle}</p>
            <p className="text-sm text-gray-600">{assessment.useCaseDescription}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {assessment.dataTypes?.map((dt: string) => (
                <Badge key={dt} variant="outline" className="text-xs">
                  {dt}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Section 3: Vendor Scores */}
          {vendors.length > 0 && (
            <>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0A2540]">
                  <BarChart3 className="h-4 w-4" />
                  Vendor Evaluation ({vendors.length} vendors)
                </h3>
                <div className="space-y-2">
                  {vendors.map((v) => (
                    <div
                      key={v.vendorName}
                      className="flex items-center justify-between rounded border px-3 py-2"
                    >
                      <span className="text-sm font-medium">{v.vendorName}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#9FE870]"
                            style={{ width: `${v.overallScore}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-sm font-bold">
                          {v.overallScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Section 4: Compliance */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0A2540]">
              <Shield className="h-4 w-4" />
              Compliance Assessment
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-gray-500">EU AI Act</p>
                <Badge
                  className={`mt-1 ${
                    assessment.aiActRiskCategory === "high_risk"
                      ? "bg-red-100 text-red-700"
                      : assessment.aiActRiskCategory === "limited_risk"
                        ? "bg-amber-100 text-amber-700"
                        : assessment.aiActRiskCategory === "prohibited"
                          ? "bg-red-500 text-white"
                          : "bg-green-100 text-green-700"
                  }`}
                >
                  {assessment.aiActRiskCategory?.replace("_", " ").toUpperCase() || "N/A"}
                </Badge>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-gray-500">DPIA Required</p>
                <Badge
                  className={`mt-1 ${assessment.dpiaRequired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                >
                  {assessment.dpiaRequired ? "YES" : "NO"}
                </Badge>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-gray-500">DORA Applies</p>
                <Badge
                  className={`mt-1 ${assessment.doraApplicable ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
                >
                  {assessment.doraApplicable ? "YES" : "NO"}
                </Badge>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-500">Compliance Score: </span>
              <span className="font-mono text-lg font-bold text-[#0A2540]">
                {assessment.complianceScore ?? "—"}/100
              </span>
            </div>
          </div>

          <Separator />

          {/* Section 5: Roadmap */}
          {phases.length > 0 && (
            <>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0A2540]">
                  <FileText className="h-4 w-4" />
                  Implementation Roadmap — {assessment.totalTimeline}
                </h3>
                <div className="flex gap-1">
                  {phases.map((p, i) => (
                    <div key={i} className="flex-1 rounded bg-gray-50 p-2 text-center">
                      <p className="text-xs font-semibold text-[#0A2540]">
                        Phase {i + 1}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{p.phaseName}</p>
                      <p className="text-xs text-gray-400">{p.duration}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Est. Budget: {assessment.estimatedBudgetRange}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Section 6: Risk Summary */}
          {riskCategories.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0A2540]">
                <ShieldAlert className="h-4 w-4" />
                Risk Summary — Overall Score:{" "}
                <span className="font-mono">{assessment.overallRiskScore}/100</span>
              </h3>
              <div className="space-y-1.5">
                {riskCategories.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-28 truncate text-xs text-gray-600">
                      {r.category}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${
                          r.score >= 70
                            ? "bg-red-400"
                            : r.score >= 40
                              ? "bg-amber-400"
                              : "bg-green-400"
                        }`}
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-xs font-semibold">
                      {r.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Gaps */}
      {assessment.complianceGaps && assessment.complianceGaps.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Compliance Gaps to Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {assessment.complianceGaps.map((gap: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="border-[#9FE870]">
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-center">
          {!isCompleted && (
            <Button
              onClick={handleComplete}
              disabled={completing}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {completing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark as Complete
            </Button>
          )}
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 sm:w-auto"
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF Report
          </Button>
          <Button
            onClick={handleViewDashboard}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Interactive Dashboard
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
