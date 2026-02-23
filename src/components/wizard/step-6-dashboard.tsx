"use client";

import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, ShieldAlert, AlertTriangle } from "lucide-react";
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

/* ---------- Gauge (semi-circle) ---------- */
function GaugeChart({ score, label }: { score: number; label: string }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const color =
    clampedScore >= 70
      ? "#059669"
      : clampedScore >= 40
        ? "#D97706"
        : "#DC2626";

  // SVG semi-circle gauge
  const radius = 60;
  const circumference = Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="100" viewBox="0 0 160 100">
        {/* Background arc */}
        <path
          d="M 20 90 A 60 60 0 0 1 140 90"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 20 90 A 60 60 0 0 1 140 90"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          className="transition-all duration-1000"
        />
        {/* Score text */}
        <text
          x="80"
          y="80"
          textAnchor="middle"
          className="fill-[#0A2540]"
          fontSize="28"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {clampedScore}
        </text>
      </svg>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

/* ---------- Risk Heatmap 5x5 ---------- */
const HEATMAP_ROWS = ["Critical", "High", "Medium", "Low", "Minimal"];
const HEATMAP_COLS = ["Compliance", "Vendor", "Operational", "Data", "Change Mgmt"];

function getHeatmapColor(value: number): string {
  if (value >= 80) return "bg-red-500 text-white";
  if (value >= 60) return "bg-red-300 text-red-900";
  if (value >= 40) return "bg-amber-300 text-amber-900";
  if (value >= 20) return "bg-yellow-200 text-yellow-800";
  return "bg-green-200 text-green-800";
}

function RiskHeatmap({
  riskCategories,
}: {
  riskCategories: { category: string; score: number }[];
}) {
  // Map risk categories to column scores
  const categoryMap = new Map(riskCategories.map((r) => [r.category.toLowerCase(), r.score]));

  const getScore = (col: string, rowIdx: number): number => {
    const baseScore = categoryMap.get(col.toLowerCase()) ?? 50;
    // Distribute across severity rows: top row gets higher proportion
    const factor = [1.2, 1.0, 0.8, 0.6, 0.4][rowIdx];
    return Math.min(100, Math.round(baseScore * factor));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-1 text-xs font-medium text-gray-400" />
            {HEATMAP_COLS.map((col) => (
              <th
                key={col}
                className="p-1 text-center text-xs font-medium text-gray-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HEATMAP_ROWS.map((row, ri) => (
            <tr key={row}>
              <td className="pr-2 text-right text-xs font-medium text-gray-500">
                {row}
              </td>
              {HEATMAP_COLS.map((col) => {
                const val = getScore(col, ri);
                return (
                  <td key={col} className="p-1">
                    <div
                      className={`flex h-10 items-center justify-center rounded text-xs font-mono font-semibold ${getHeatmapColor(val)}`}
                    >
                      {val}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Step6Props {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  onNext: () => void;
  onBack: () => void;
}

export function Step6Dashboard({
  assessment,
  onNext,
  onBack,
}: Step6Props) {
  const vendors = (assessment.vendorScores || []) as Array<{
    vendorName: string;
    overallScore: number;
    securityScore: number;
    complianceScore: number;
    functionalityScore: number;
    integrationScore: number;
    costScore: number;
  }>;

  const riskCategories = (assessment.riskCategories || []) as Array<{
    category: string;
    score: number;
    details: string;
    mitigations: string[];
  }>;

  // Build radar chart data from top 3 vendors
  const radarData =
    vendors.length > 0
      ? [
          { dimension: "Security", ...Object.fromEntries(vendors.slice(0, 4).map((v) => [v.vendorName, v.securityScore])) },
          { dimension: "Compliance", ...Object.fromEntries(vendors.slice(0, 4).map((v) => [v.vendorName, v.complianceScore])) },
          { dimension: "Functionality", ...Object.fromEntries(vendors.slice(0, 4).map((v) => [v.vendorName, v.functionalityScore])) },
          { dimension: "Integration", ...Object.fromEntries(vendors.slice(0, 4).map((v) => [v.vendorName, v.integrationScore])) },
          { dimension: "Cost", ...Object.fromEntries(vendors.slice(0, 4).map((v) => [v.vendorName, v.costScore])) },
        ]
      : [];

  const RADAR_COLORS = ["#0A2540", "#9FE870", "#2563EB", "#D97706"];

  // Risk bar chart data
  const riskBarData = riskCategories.map((c) => ({
    name: c.category.length > 12 ? c.category.slice(0, 12) + "..." : c.category,
    score: c.score,
    fullName: c.category,
  }));

  const getRiskBarColor = (score: number) => {
    if (score >= 70) return "#DC2626";
    if (score >= 40) return "#D97706";
    return "#059669";
  };

  // Top risks sorted by score
  const topRisks = [...riskCategories].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 6: Risk Dashboard</CardTitle>
        </CardHeader>
      </Card>

      {/* Gauges */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex justify-center pt-6">
            <GaugeChart
              score={assessment.overallRiskScore ?? 50}
              label="Overall Risk"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex justify-center pt-6">
            <GaugeChart
              score={assessment.complianceScore ?? 50}
              label="Compliance Readiness"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex justify-center pt-6">
            <GaugeChart
              score={
                vendors.length > 0
                  ? Math.round(
                      vendors.reduce((s, v) => s + v.overallScore, 0) /
                        vendors.length
                    )
                  : 0
              }
              label="Avg Vendor Score"
            />
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      {vendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendor Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                />
                {vendors.slice(0, 4).map((v, i) => (
                  <Radar
                    key={v.vendorName}
                    name={v.vendorName}
                    dataKey={v.vendorName}
                    stroke={RADAR_COLORS[i]}
                    fill={RADAR_COLORS[i]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {vendors.slice(0, 4).map((v, i) => (
                <div key={v.vendorName} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: RADAR_COLORS[i] }}
                  />
                  {v.vendorName}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Heatmap */}
      {riskCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskHeatmap riskCategories={riskCategories} />
          </CardContent>
        </Card>
      )}

      {/* Risk Categories Bar Chart */}
      {riskBarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskBarData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number | undefined) => [`${value ?? 0}/100`, "Risk Score"]}
                  labelFormatter={(_: unknown, payload: readonly { payload?: { fullName?: string } }[]) =>
                    payload?.[0]?.payload?.fullName || ""
                  }
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {riskBarData.map((entry, i) => (
                    <Cell key={i} fill={getRiskBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Risks */}
      {topRisks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Top Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRisks.map((risk, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A2540] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {risk.category}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        risk.score >= 70
                          ? "border-red-200 text-red-700"
                          : risk.score >= 40
                            ? "border-amber-200 text-amber-700"
                            : "border-green-200 text-green-700"
                      }
                    >
                      {risk.score}/100
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-gray-600">{risk.details}</p>
                  {risk.mitigations.length > 0 && (
                    <div className="mt-2 rounded bg-gray-50 p-2">
                      <p className="mb-1 text-xs font-semibold text-gray-500">
                        Mitigations:
                      </p>
                      <ul className="space-y-1">
                        {risk.mitigations.map((m, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-1.5 text-xs text-gray-500"
                          >
                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
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
          onClick={onNext}
          className="bg-[#0A2540] hover:bg-[#0A2540]/90"
        >
          Next: Review & Export
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
