"use client";

import { useState } from "react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Step1OrgProfile } from "./step-1-org-profile";
import { Step2UseCase } from "./step-2-use-case";
import { Step3Vendors } from "./step-3-vendors";
import { Step4Compliance } from "./step-4-compliance";
import { Step5Roadmap } from "./step-5-roadmap";
import { Step6Dashboard } from "./step-6-dashboard";
import { Step7Export } from "./step-7-export";

const STEPS = [
  { number: 1, label: "Organization" },
  { number: 2, label: "Use Case" },
  { number: 3, label: "Vendors" },
  { number: 4, label: "Compliance" },
  { number: 5, label: "Roadmap" },
  { number: 6, label: "Dashboard" },
  { number: 7, label: "Export" },
];

interface WizardShellProps {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  initialStep: number;
}

export function WizardShell({
  assessment,
  assessmentId,
  initialStep,
}: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState(
    Math.min(initialStep, assessment.currentStep || 1)
  );

  const goToNext = () => setCurrentStep((s) => Math.min(s + 1, 7));
  const goToPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Progress Indicator */}
      <nav className="mb-10">
        <ol className="flex items-center">
          {STEPS.map((step, i) => {
            const isCompleted = (assessment.currentStep || 1) > step.number;
            const isCurrent = currentStep === step.number;
            const isAccessible = step.number <= (assessment.currentStep || 1);

            return (
              <li
                key={step.number}
                className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}
              >
                <button
                  onClick={() => isAccessible && setCurrentStep(step.number)}
                  disabled={!isAccessible}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isCurrent && "bg-[#0A2540] text-white",
                    isCompleted && !isCurrent && "text-[#059669]",
                    !isCompleted && !isCurrent && "text-gray-400",
                    isAccessible && !isCurrent && "hover:bg-gray-100 cursor-pointer",
                    !isAccessible && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle
                      className={cn("h-4 w-4", isCurrent ? "fill-current" : "")}
                    />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.number}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 hidden h-0.5 flex-1 sm:block",
                      isCompleted ? "bg-[#9FE870]" : "bg-gray-200"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Step1OrgProfile
            assessment={assessment}
            assessmentId={assessmentId}
            onNext={goToNext}
          />
        )}
        {currentStep === 2 && (
          <Step2UseCase
            assessment={assessment}
            assessmentId={assessmentId}
            onNext={goToNext}
            onBack={goToPrev}
          />
        )}
        {currentStep === 3 && (
          <Step3Vendors
            assessment={assessment}
            assessmentId={assessmentId}
            onNext={goToNext}
            onBack={goToPrev}
          />
        )}
        {currentStep === 4 && (
          <Step4Compliance
            assessment={assessment}
            assessmentId={assessmentId}
            onNext={goToNext}
            onBack={goToPrev}
          />
        )}
        {currentStep === 5 && (
          <Step5Roadmap
            assessment={assessment}
            assessmentId={assessmentId}
            onNext={goToNext}
            onBack={goToPrev}
          />
        )}
        {currentStep === 6 && (
          <Step6Dashboard
            assessment={assessment}
            assessmentId={assessmentId}
            onNext={goToNext}
            onBack={goToPrev}
          />
        )}
        {currentStep === 7 && (
          <Step7Export
            assessment={assessment}
            assessmentId={assessmentId}
            onBack={goToPrev}
          />
        )}
      </div>
    </div>
  );
}
