import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import {
  Compass,
  Shield,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Vendor Evaluation",
    description:
      "AI-powered scoring of enterprise AI vendors across security, compliance, functionality, and cost dimensions.",
  },
  {
    icon: FileText,
    title: "Compliance Assessment",
    description:
      "Automated EU AI Act classification, GDPR DPIA analysis, and DORA applicability checks for regulated industries.",
  },
  {
    icon: BarChart3,
    title: "Implementation Roadmap",
    description:
      "Phased deployment plan with risk scoring, timeline visualization, and actionable milestones.",
  },
  {
    icon: Compass,
    title: "Risk Dashboard",
    description:
      "Interactive visualizations with risk heatmaps, vendor comparisons, and compliance readiness metrics.",
  },
];

const steps = [
  "Define your organization profile & regulatory context",
  "Describe your AI use case and data requirements",
  "Receive AI-powered vendor evaluation scores",
  "Get comprehensive compliance assessment",
  "Review phased implementation roadmap",
  "Explore interactive risk dashboard",
  "Export professional PDF report",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0A2540] px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#9FE870]/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9FE870]/30 bg-[#9FE870]/10 px-4 py-1.5 text-sm text-[#9FE870]">
            <Compass className="h-4 w-4" />
            Enterprise AI Governance Advisor
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Navigate AI Implementation
            <span className="block text-[#9FE870]">in Regulated Industries</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300">
            From vendor evaluation to compliance assessment to implementation
            roadmap — get a complete, personalized AI deployment plan for
            fintech, banking, healthcare, and insurance.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="bg-[#9FE870] px-8 text-[#0A2540] hover:bg-[#9FE870]/90"
                >
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-[#9FE870] px-8 text-[#0A2540] hover:bg-[#9FE870]/90"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#FAFBFC] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-[#0A2540]">
            Your AI Implementation Copilot
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600">
            Not just a checklist — a full digital AI Governance Advisor that
            evaluates, scores, and plans your enterprise AI deployment.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <feature.icon className="mb-4 h-10 w-10 text-[#9FE870]" />
                <h3 className="mb-2 text-lg font-semibold text-[#0A2540]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#0A2540]">
            7-Step Assessment Wizard
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-sm font-bold text-white">
                  {i + 1}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <CheckCircle className="h-4 w-4 text-[#9FE870]" />
                  <span className="text-gray-700">{step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-[#0A2540] px-4 py-8 text-center text-sm text-gray-400">
        <p>AI Implementation Compass &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">
          Powered by Claude AI &middot; Built for regulated industries
        </p>
      </footer>
    </div>
  );
}
