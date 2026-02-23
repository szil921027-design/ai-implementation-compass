"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight } from "lucide-react";

const USE_CASE_CATEGORIES = [
  { value: "customer_service", label: "Customer Service" },
  { value: "compliance_automation", label: "Compliance Automation" },
  { value: "document_processing", label: "Document Processing" },
  { value: "fraud_detection", label: "Fraud Detection" },
  { value: "internal_search", label: "Internal Search" },
  { value: "code_generation", label: "Code Generation" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "other", label: "Other" },
] as const;

const DATA_TYPES = [
  "Customer PII (names, emails, addresses)",
  "Financial data (transactions, account details)",
  "Employee data",
  "Health data",
  "Biometric data",
  "Public/non-sensitive data only",
  "Third-party data",
];

const DATA_VOLUMES = [
  { value: "low", label: "Low", description: "<1K records/day" },
  { value: "medium", label: "Medium", description: "1K-100K records/day" },
  { value: "high", label: "High", description: "100K+ records/day" },
] as const;

const formSchema = z.object({
  useCaseTitle: z.string().min(1, "Use case title is required"),
  useCaseCategory: z.enum([
    "customer_service", "compliance_automation", "document_processing",
    "fraud_detection", "internal_search", "code_generation", "data_analysis", "other",
  ]),
  useCaseDescription: z.string().min(20, "Please provide a more detailed description (min 20 characters)"),
  dataTypes: z.array(z.string()).min(1, "Select at least one data type"),
  dataVolume: z.enum(["low", "medium", "high"]),
  currentProcess: z.string().min(10, "Please describe the current process (min 10 characters)"),
  expectedOutcome: z.string().min(10, "Please describe expected outcomes (min 10 characters)"),
  estimatedUsers: z.number().min(1, "Must have at least 1 user"),
});

type FormData = z.infer<typeof formSchema>;

interface Step2Props {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  onNext: () => void;
  onBack: () => void;
}

export function Step2UseCase({ assessment, assessmentId, onNext, onBack }: Step2Props) {
  const updateStep2 = useMutation(api.assessments.updateStep2);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      useCaseTitle: assessment.useCaseTitle || "",
      useCaseCategory: assessment.useCaseCategory || "customer_service",
      useCaseDescription: assessment.useCaseDescription || "",
      dataTypes: assessment.dataTypes || [],
      dataVolume: assessment.dataVolume || "medium",
      currentProcess: assessment.currentProcess || "",
      expectedOutcome: assessment.expectedOutcome || "",
      estimatedUsers: assessment.estimatedUsers || 50,
    },
  });

  const selectedDataTypes = watch("dataTypes");

  const toggleDataType = (value: string) => {
    const updated = selectedDataTypes.includes(value)
      ? selectedDataTypes.filter((v) => v !== value)
      : [...selectedDataTypes, value];
    setValue("dataTypes", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    await updateStep2({ id: assessmentId, ...data });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Step 2: AI Use Case Definition</CardTitle>
          <CardDescription>
            Describe what you want to automate and the data involved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Use Case Title */}
          <div className="space-y-2">
            <Label htmlFor="useCaseTitle">Use Case Title</Label>
            <Input
              id="useCaseTitle"
              placeholder="e.g. Customer Service QA Automation"
              {...register("useCaseTitle")}
            />
            {errors.useCaseTitle && (
              <p className="text-sm text-red-500">{errors.useCaseTitle.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Use Case Category</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {USE_CASE_CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                    watch("useCaseCategory") === cat.value
                      ? "border-[#0A2540] bg-[#0A2540] text-white"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={cat.value}
                    className="sr-only"
                    {...register("useCaseCategory")}
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="useCaseDescription">Describe the Use Case</Label>
            <Textarea
              id="useCaseDescription"
              rows={4}
              placeholder="We want to automate quality assurance reviews of customer support interactions using AI to evaluate agent responses against 14 quality criteria..."
              {...register("useCaseDescription")}
            />
            {errors.useCaseDescription && (
              <p className="text-sm text-red-500">{errors.useCaseDescription.message}</p>
            )}
          </div>

          {/* Data Types */}
          <div className="space-y-2">
            <Label>What data types will this AI process?</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DATA_TYPES.map((dt) => (
                <label
                  key={dt}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selectedDataTypes.includes(dt)
                      ? "border-[#0A2540] bg-[#0A2540]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    checked={selectedDataTypes.includes(dt)}
                    onCheckedChange={() => toggleDataType(dt)}
                  />
                  {dt}
                </label>
              ))}
            </div>
            {errors.dataTypes && (
              <p className="text-sm text-red-500">{errors.dataTypes.message}</p>
            )}
          </div>

          {/* Data Volume */}
          <div className="space-y-2">
            <Label>Expected Data Volume</Label>
            <div className="grid grid-cols-3 gap-2">
              {DATA_VOLUMES.map((vol) => (
                <label
                  key={vol.value}
                  className={`flex cursor-pointer flex-col items-center rounded-lg border px-3 py-3 text-center transition-colors ${
                    watch("dataVolume") === vol.value
                      ? "border-[#0A2540] bg-[#0A2540] text-white"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={vol.value}
                    className="sr-only"
                    {...register("dataVolume")}
                  />
                  <span className="text-sm font-medium">{vol.label}</span>
                  <span className={`text-xs ${watch("dataVolume") === vol.value ? "text-gray-300" : "text-gray-500"}`}>
                    {vol.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Process */}
          <div className="space-y-2">
            <Label htmlFor="currentProcess">How is this done today?</Label>
            <Textarea
              id="currentProcess"
              rows={3}
              placeholder="Currently, team leads manually review a random sample of 5% of customer interactions..."
              {...register("currentProcess")}
            />
            {errors.currentProcess && (
              <p className="text-sm text-red-500">{errors.currentProcess.message}</p>
            )}
          </div>

          {/* Expected Outcome */}
          <div className="space-y-2">
            <Label htmlFor="expectedOutcome">What does success look like?</Label>
            <Textarea
              id="expectedOutcome"
              rows={3}
              placeholder="100% of customer interactions reviewed within 24 hours, 30% reduction in quality issues..."
              {...register("expectedOutcome")}
            />
            {errors.expectedOutcome && (
              <p className="text-sm text-red-500">{errors.expectedOutcome.message}</p>
            )}
          </div>

          {/* Estimated Users */}
          <div className="space-y-2">
            <Label htmlFor="estimatedUsers">Estimated Number of Users</Label>
            <Input
              id="estimatedUsers"
              type="number"
              min={1}
              placeholder="e.g. 50"
              {...register("estimatedUsers", { valueAsNumber: true })}
            />
            {errors.estimatedUsers && (
              <p className="text-sm text-red-500">{errors.estimatedUsers.message}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0A2540] hover:bg-[#0A2540]/90"
            >
              {isSubmitting ? "Saving..." : "Next: Vendor Evaluation"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
