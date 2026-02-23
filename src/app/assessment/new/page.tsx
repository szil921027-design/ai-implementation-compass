"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Suspense } from "react";
import { WizardShell } from "@/components/wizard/wizard-shell";

function WizardContent() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id") as Id<"assessments"> | null;
  const initialStep = parseInt(searchParams.get("step") || "1", 10);

  const assessment = useQuery(
    api.assessments.getById,
    assessmentId ? { id: assessmentId } : "skip"
  );

  if (!assessmentId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">No assessment ID provided. Please start from the dashboard.</p>
      </div>
    );
  }

  if (assessment === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0A2540] border-t-transparent" />
      </div>
    );
  }

  if (assessment === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Assessment not found.</p>
      </div>
    );
  }

  return (
    <WizardShell
      assessment={assessment}
      assessmentId={assessmentId}
      initialStep={initialStep}
    />
  );
}

export default function NewAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0A2540] border-t-transparent" />
        </div>
      }
    >
      <WizardContent />
    </Suspense>
  );
}
