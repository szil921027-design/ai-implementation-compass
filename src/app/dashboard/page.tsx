"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssessmentCard {
  _id: string;
  status: "draft" | "in_progress" | "completed";
  currentStep?: number;
  useCaseTitle?: string;
  orgName?: string;
  industry?: string;
  _creationTime: number;
  overallRiskScore?: number;
  complianceScore?: number;
  aiActRiskCategory?: string;
  vendorScores?: Array<{ vendorName: string; overallScore: number }>;
  totalTimeline?: string;
}

const statusConfig = {
  draft: { label: "Draft", icon: Clock, color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "In Progress", icon: AlertCircle, color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-green-100 text-green-700" },
};

const industryLabels: Record<string, string> = {
  fintech: "Fintech",
  banking: "Banking",
  insurance: "Insurance",
  healthcare: "Healthcare",
  retail: "Retail",
  manufacturing: "Manufacturing",
  public_sector: "Public Sector",
  other: "Other",
};

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const assessments = useQuery(
    api.assessments.getAll,
    user?.id ? { userId: user.id } : "skip"
  );
  const createAssessment = useMutation(api.assessments.create);
  const removeAssessment = useMutation(api.assessments.remove);

  const handleNewAssessment = async () => {
    if (!user?.id) return;
    const id = await createAssessment({ userId: user.id });
    router.push(`/assessment/new?id=${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this assessment?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await removeAssessment({ id: id as any });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A2540]">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.firstName || "User"}. Manage your AI assessments.
          </p>
        </div>
        <Button onClick={handleNewAssessment} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </div>

      {assessments === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 w-3/4 rounded bg-gray-200" /><div className="mt-2 h-4 w-1/2 rounded bg-gray-100" /></CardHeader>
              <CardContent><div className="h-4 w-full rounded bg-gray-100" /></CardContent>
            </Card>
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-700">No assessments yet</h3>
            <p className="mb-6 text-sm text-gray-500">Create your first AI implementation assessment to get started.</p>
            <Button onClick={handleNewAssessment} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
              <Plus className="mr-2 h-4 w-4" />
              Create First Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((a: AssessmentCard) => {
            const status = statusConfig[a.status];
            const StatusIcon = status.icon;
            const topVendor = a.vendorScores?.[0];

            return (
              <Card
                key={a._id}
                className="group cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-[#9FE870]/30"
                onClick={() => {
                  if (a.status === "completed") {
                    router.push(`/assessment/${a._id}`);
                  } else {
                    router.push(`/assessment/new?id=${a._id}&step=${a.currentStep || 1}`);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base leading-tight">
                      {a.useCaseTitle || a.orgName || "Untitled Assessment"}
                    </CardTitle>
                    <Badge className={`shrink-0 ${status.color}`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    {a.orgName && a.industry
                      ? `${a.orgName} — ${industryLabels[a.industry] || a.industry}`
                      : "Not yet started"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Scores row for completed assessments */}
                  {a.status === "completed" && (
                    <div className="flex items-center gap-2">
                      {a.overallRiskScore != null && (
                        <div className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1">
                          <ShieldAlert className="h-3 w-3 text-amber-500" />
                          <span className="font-mono text-xs font-semibold">{a.overallRiskScore}</span>
                          <span className="text-xs text-gray-400">risk</span>
                        </div>
                      )}
                      {a.complianceScore != null && (
                        <div className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1">
                          <Shield className="h-3 w-3 text-blue-500" />
                          <span className="font-mono text-xs font-semibold">{a.complianceScore}</span>
                          <span className="text-xs text-gray-400">compliance</span>
                        </div>
                      )}
                      {a.aiActRiskCategory && (
                        <Badge variant="outline" className="text-xs">
                          {a.aiActRiskCategory.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Top vendor for completed */}
                  {a.status === "completed" && topVendor && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Top vendor:</span>
                      <span className="font-medium text-[#0A2540]">{topVendor.vendorName}</span>
                      <span className="font-mono font-semibold">{topVendor.overallScore}</span>
                    </div>
                  )}

                  {/* Timeline for completed */}
                  {a.status === "completed" && a.totalTimeline && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {a.totalTimeline}
                    </div>
                  )}

                  {/* Step progress and date */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Step {a.currentStep || 1} of 7</span>
                    <div className="flex items-center gap-2">
                      <span>{new Date(a._creationTime).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => handleDelete(e, a._id)}
                        className="hidden rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 group-hover:block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#9FE870] transition-all"
                      style={{ width: `${((a.currentStep || 1) / 7) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
