"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Loader2,
  Shield,
  FileCheck,
  Cpu,
  Link2,
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const SCORE_DIMS = [
  { key: "securityScore" as const, label: "Security", icon: Shield, color: "#0A2540" },
  { key: "complianceScore" as const, label: "Compliance", icon: FileCheck, color: "#2563EB" },
  { key: "functionalityScore" as const, label: "Functionality", icon: Cpu, color: "#059669" },
  { key: "integrationScore" as const, label: "Integration", icon: Link2, color: "#D97706" },
  { key: "costScore" as const, label: "Cost", icon: DollarSign, color: "#7C3AED" },
];
const RADAR_COLORS = ["#0A2540", "#9FE870", "#2563EB", "#D97706"];

function GaugeChart({ score, label }: { score: number; label: string }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const color = clampedScore >= 70 ? "#059669" : clampedScore >= 40 ? "#D97706" : "#DC2626";
  const radius = 60;
  const circumference = Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="100" viewBox="0 0 160 100">
        <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={`${offset}`} className="transition-all duration-1000" />
        <text x="80" y="80" textAnchor="middle" className="fill-[#0A2540]" fontSize="28" fontWeight="bold" fontFamily="monospace">{clampedScore}</text>
      </svg>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

function PhaseTimeline({ phases }: { phases: Array<{ phaseName: string; duration: string; keyActivities: string[]; deliverables: string[] }> }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const BAR_COLORS = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DC2626"];

  return (
    <div className="space-y-2">
      {/* Visual bar */}
      <div className="flex gap-1">
        {phases.map((p, i) => (
          <div key={i} className="flex-1">
            <div className="h-3 rounded-full" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
            <p className="mt-1 text-center text-xs font-medium text-gray-600 truncate">{p.phaseName}</p>
            <p className="text-center text-xs text-gray-400">{p.duration}</p>
          </div>
        ))}
      </div>
      {/* Expandable details */}
      {phases.map((phase, i) => (
        <div key={i} className="rounded-lg border">
          <button onClick={() => setExpanded(expanded === i ? null : i)} className="flex w-full items-center justify-between px-4 py-2 text-left text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}>{i + 1}</div>
              <span className="font-medium">{phase.phaseName}</span>
              <span className="text-xs text-gray-400">{phase.duration}</span>
            </div>
            {expanded === i ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {expanded === i && (
            <div className="border-t px-4 py-3 text-sm">
              {phase.keyActivities.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-500">Key Activities:</p>
                  <ul className="mt-1 space-y-1">{phase.keyActivities.map((a, j) => <li key={j} className="flex items-start gap-2 text-gray-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />{a}</li>)}</ul>
                </div>
              )}
              {phase.deliverables.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500">Deliverables:</p>
                  <div className="mt-1 flex flex-wrap gap-1">{phase.deliverables.map((d, j) => <Badge key={j} variant="outline" className="text-xs font-normal">{d}</Badge>)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const assessmentId = params.id as Id<"assessments">;
  const assessment = useQuery(api.assessments.getById, { id: assessmentId });
  const [downloading, setDownloading] = useState(false);

  if (assessment === undefined) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0A2540] border-t-transparent" /></div>;
  }
  if (assessment === null) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-gray-500">Assessment not found.</p></div>;
  }

  const vendors = (assessment.vendorScores || []) as Array<{
    vendorName: string; overallScore: number; securityScore: number; complianceScore: number;
    functionalityScore: number; integrationScore: number; costScore: number; riskFlags: string[]; recommendation: string;
  }>;
  const phases = (assessment.phases || []) as Array<{ phaseName: string; duration: string; keyActivities: string[]; deliverables: string[] }>;
  const riskCategories = (assessment.riskCategories || []) as Array<{ category: string; score: number; details: string; mitigations: string[] }>;

  const radarData = vendors.length > 0
    ? ["Security", "Compliance", "Functionality", "Integration", "Cost"].map((dim) => ({
        dimension: dim,
        ...Object.fromEntries(vendors.slice(0, 4).map((v) => [v.vendorName, v[`${dim.toLowerCase()}Score` as keyof typeof v] as number])),
      }))
    : [];

  const riskBarData = riskCategories.map((c) => ({
    name: c.category.length > 14 ? c.category.slice(0, 14) + "..." : c.category,
    score: c.score,
    fullName: c.category,
  }));

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0A2540]">{assessment.useCaseTitle || "Assessment"}</h1>
            <p className="text-sm text-gray-500">{assessment.orgName} &middot; {assessment.industry} &middot; {new Date(assessment._creationTime).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={assessment.status === "completed" ? "default" : "secondary"}>{assessment.status}</Badge>
          <Button onClick={handleDownloadPDF} disabled={downloading} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
            {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Gauge Row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex justify-center pt-6"><GaugeChart score={assessment.overallRiskScore ?? 50} label="Overall Risk" /></CardContent></Card>
        <Card><CardContent className="flex justify-center pt-6"><GaugeChart score={assessment.complianceScore ?? 50} label="Compliance" /></CardContent></Card>
        <Card><CardContent className="flex justify-center pt-6"><GaugeChart score={vendors.length > 0 ? Math.round(vendors.reduce((s, v) => s + v.overallScore, 0) / vendors.length) : 0} label="Avg Vendor Score" /></CardContent></Card>
      </div>

      {/* Vendor Radar + Scores */}
      {vendors.length > 0 && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Vendor Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  {vendors.slice(0, 4).map((v, i) => (
                    <Radar key={v.vendorName} name={v.vendorName} dataKey={v.vendorName} stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                  ))}
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {vendors.slice(0, 4).map((v, i) => (
                  <div key={v.vendorName} className="flex items-center gap-1.5 text-xs"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RADAR_COLORS[i] }} />{v.vendorName}</div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Vendor Scores</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {vendors.map((vendor, idx) => (
                <div key={vendor.vendorName} className={`rounded-lg border p-3 ${idx === 0 ? "border-[#9FE870]" : ""}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">{vendor.vendorName}</span>
                    <span className="font-mono text-sm font-bold">{vendor.overallScore}</span>
                  </div>
                  <div className="space-y-1">
                    {SCORE_DIMS.map((dim) => (
                      <div key={dim.key} className="flex items-center gap-2 text-xs">
                        <dim.icon className="h-3 w-3 text-gray-400" />
                        <span className="w-20 text-gray-500">{dim.label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width: `${vendor[dim.key]}%`, backgroundColor: dim.color }} />
                        </div>
                        <span className="w-6 text-right font-mono">{vendor[dim.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-gray-500">EU AI Act</p>
            <Badge className={`mt-2 ${assessment.aiActRiskCategory === "high_risk" ? "bg-red-100 text-red-700" : assessment.aiActRiskCategory === "limited_risk" ? "bg-amber-100 text-amber-700" : assessment.aiActRiskCategory === "prohibited" ? "bg-red-500 text-white" : "bg-green-100 text-green-700"}`}>
              {assessment.aiActRiskCategory?.replace("_", " ").toUpperCase() || "N/A"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-gray-500">DPIA Required</p>
            <Badge className={`mt-2 ${assessment.dpiaRequired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {assessment.dpiaRequired ? "YES" : "NO"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-gray-500">DORA Applies</p>
            <Badge className={`mt-2 ${assessment.doraApplicable ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
              {assessment.doraApplicable ? "YES" : "NO"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Risk Bar Chart */}
      {riskBarData.length > 0 && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Risk by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskBarData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number | undefined) => [`${value ?? 0}/100`, "Risk Score"]} labelFormatter={(_: unknown, payload: readonly { payload?: { fullName?: string } }[]) => payload?.[0]?.payload?.fullName || ""} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {riskBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 70 ? "#DC2626" : entry.score >= 40 ? "#D97706" : "#059669"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-4 w-4 text-amber-500" />Top Risks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[...riskCategories].sort((a, b) => b.score - a.score).slice(0, 5).map((risk, i) => (
                <div key={i} className="rounded border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold">{risk.category}</span>
                    <Badge variant="outline" className={risk.score >= 70 ? "border-red-200 text-red-700" : risk.score >= 40 ? "border-amber-200 text-amber-700" : "border-green-200 text-green-700"}>{risk.score}/100</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{risk.details}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Implementation Timeline */}
      {phases.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Implementation Timeline — {assessment.totalTimeline}
              {assessment.estimatedBudgetRange && <span className="text-sm font-normal text-gray-500"> &middot; Est. Budget: {assessment.estimatedBudgetRange}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhaseTimeline phases={phases} />
          </CardContent>
        </Card>
      )}

      {/* Compliance Gaps */}
      {assessment.complianceGaps && assessment.complianceGaps.length > 0 && (
        <Card className="mb-6 border-amber-200">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base text-amber-700"><AlertTriangle className="h-4 w-4" />Compliance Gaps</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {assessment.complianceGaps.map((gap: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />{gap}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
