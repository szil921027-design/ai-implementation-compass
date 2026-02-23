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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";

const INDUSTRIES = [
  { value: "fintech", label: "Fintech" },
  { value: "banking", label: "Banking" },
  { value: "insurance", label: "Insurance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "public_sector", label: "Public Sector" },
  { value: "other", label: "Other" },
] as const;

const ORG_SIZES = [
  { value: "startup", label: "Startup", description: "<50 employees" },
  { value: "scaleup", label: "Scaleup", description: "50-500 employees" },
  { value: "mid_market", label: "Mid-Market", description: "500-5,000 employees" },
  { value: "enterprise", label: "Enterprise", description: "5,000+ employees" },
] as const;

const REGULATORY_FRAMEWORKS = [
  "EU AI Act",
  "GDPR",
  "DORA",
  "FCA",
  "PSD2",
  "MiFID II",
  "HIPAA",
  "SOX",
  "PCI DSS",
  "CCPA",
];

const JURISDICTIONS = ["EU", "UK", "US", "Global"];

const AI_MATURITY = [
  { value: "none", label: "None", description: "No AI initiatives" },
  { value: "exploring", label: "Exploring", description: "Researching AI options" },
  { value: "piloting", label: "Piloting", description: "Running AI pilots" },
  { value: "scaling", label: "Scaling", description: "Deploying AI at scale" },
  { value: "optimizing", label: "Optimizing", description: "Mature AI operations" },
] as const;

const formSchema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
  industry: z.enum(["fintech", "banking", "insurance", "healthcare", "retail", "manufacturing", "public_sector", "other"]),
  orgSize: z.enum(["startup", "scaleup", "mid_market", "enterprise"]),
  employeeCount: z.number().min(1, "Must have at least 1 employee"),
  regulatoryFrameworks: z.array(z.string()).min(1, "Select at least one framework"),
  jurisdiction: z.array(z.string()).min(1, "Select at least one jurisdiction"),
  existingAIMaturity: z.enum(["none", "exploring", "piloting", "scaling", "optimizing"]),
});

type FormData = z.infer<typeof formSchema>;

interface Step1Props {
  assessment: Doc<"assessments">;
  assessmentId: Id<"assessments">;
  onNext: () => void;
}

export function Step1OrgProfile({ assessment, assessmentId, onNext }: Step1Props) {
  const updateStep1 = useMutation(api.assessments.updateStep1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgName: assessment.orgName || "",
      industry: assessment.industry || "fintech",
      orgSize: assessment.orgSize || "scaleup",
      employeeCount: assessment.employeeCount || 100,
      regulatoryFrameworks: assessment.regulatoryFrameworks || [],
      jurisdiction: assessment.jurisdiction || [],
      existingAIMaturity: assessment.existingAIMaturity || "exploring",
    },
  });

  const selectedFrameworks = watch("regulatoryFrameworks");
  const selectedJurisdictions = watch("jurisdiction");

  const toggleArrayValue = (field: "regulatoryFrameworks" | "jurisdiction", value: string) => {
    const current = field === "regulatoryFrameworks" ? selectedFrameworks : selectedJurisdictions;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, updated, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    await updateStep1({ id: assessmentId, ...data });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Organization Profile</CardTitle>
          <CardDescription>
            Tell us about your organization and regulatory environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              placeholder="e.g. Acme Financial Services"
              {...register("orgName")}
            />
            {errors.orgName && (
              <p className="text-sm text-red-500">{errors.orgName.message}</p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label>Industry</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INDUSTRIES.map((ind) => (
                <label
                  key={ind.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                    watch("industry") === ind.value
                      ? "border-[#0A2540] bg-[#0A2540] text-white"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={ind.value}
                    className="sr-only"
                    {...register("industry")}
                  />
                  {ind.label}
                </label>
              ))}
            </div>
          </div>

          {/* Organization Size */}
          <div className="space-y-2">
            <Label>Organization Size</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ORG_SIZES.map((size) => (
                <label
                  key={size.value}
                  className={`flex cursor-pointer flex-col items-center rounded-lg border px-3 py-3 text-center transition-colors ${
                    watch("orgSize") === size.value
                      ? "border-[#0A2540] bg-[#0A2540] text-white"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={size.value}
                    className="sr-only"
                    {...register("orgSize")}
                  />
                  <span className="text-sm font-medium">{size.label}</span>
                  <span className={`text-xs ${watch("orgSize") === size.value ? "text-gray-300" : "text-gray-500"}`}>
                    {size.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Employee Count */}
          <div className="space-y-2">
            <Label htmlFor="employeeCount">Employee Count</Label>
            <Input
              id="employeeCount"
              type="number"
              min={1}
              placeholder="e.g. 500"
              {...register("employeeCount", { valueAsNumber: true })}
            />
            {errors.employeeCount && (
              <p className="text-sm text-red-500">{errors.employeeCount.message}</p>
            )}
          </div>

          {/* Regulatory Frameworks */}
          <div className="space-y-2">
            <Label>Regulatory Frameworks</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {REGULATORY_FRAMEWORKS.map((fw) => (
                <label
                  key={fw}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selectedFrameworks.includes(fw)
                      ? "border-[#0A2540] bg-[#0A2540]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    checked={selectedFrameworks.includes(fw)}
                    onCheckedChange={() => toggleArrayValue("regulatoryFrameworks", fw)}
                  />
                  {fw}
                </label>
              ))}
            </div>
            {errors.regulatoryFrameworks && (
              <p className="text-sm text-red-500">{errors.regulatoryFrameworks.message}</p>
            )}
          </div>

          {/* Jurisdiction */}
          <div className="space-y-2">
            <Label>Primary Jurisdiction(s)</Label>
            <div className="flex gap-2">
              {JURISDICTIONS.map((j) => (
                <label
                  key={j}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedJurisdictions.includes(j)
                      ? "border-[#0A2540] bg-[#0A2540]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    checked={selectedJurisdictions.includes(j)}
                    onCheckedChange={() => toggleArrayValue("jurisdiction", j)}
                  />
                  {j}
                </label>
              ))}
            </div>
            {errors.jurisdiction && (
              <p className="text-sm text-red-500">{errors.jurisdiction.message}</p>
            )}
          </div>

          {/* AI Maturity */}
          <div className="space-y-2">
            <Label>Current AI Maturity</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {AI_MATURITY.map((level) => (
                <label
                  key={level.value}
                  className={`flex cursor-pointer flex-col rounded-lg border px-3 py-3 text-center transition-colors ${
                    watch("existingAIMaturity") === level.value
                      ? "border-[#0A2540] bg-[#0A2540] text-white"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={level.value}
                    className="sr-only"
                    {...register("existingAIMaturity")}
                  />
                  <span className="text-sm font-medium">{level.label}</span>
                  <span className={`text-xs ${watch("existingAIMaturity") === level.value ? "text-gray-300" : "text-gray-500"}`}>
                    {level.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0A2540] hover:bg-[#0A2540]/90"
            >
              {isSubmitting ? "Saving..." : "Next: AI Use Case"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
