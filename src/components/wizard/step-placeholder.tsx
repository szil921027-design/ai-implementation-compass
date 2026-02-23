"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Construction } from "lucide-react";

interface StepPlaceholderProps {
  step: number;
  title: string;
  description: string;
  onNext?: () => void;
  onBack?: () => void;
}

export function StepPlaceholder({
  step,
  title,
  description,
  onNext,
  onBack,
}: StepPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Step {step}: {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Construction className="mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-2 text-lg font-medium text-gray-700">{title}</p>
          <p className="mb-8 max-w-md text-sm text-gray-500">{description}</p>
          <p className="text-sm text-gray-400">
            Coming in Sprint 3 — AI Integration
          </p>
        </div>
        <div className="flex justify-between pt-4">
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {onNext && (
            <Button onClick={onNext} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
