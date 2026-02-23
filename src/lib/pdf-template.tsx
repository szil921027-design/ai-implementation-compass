import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const colors = {
  navy: "#0A2540",
  green: "#9FE870",
  red: "#DC2626",
  amber: "#D97706",
  blue: "#2563EB",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1F2937",
  },
  // Cover
  coverPage: {
    padding: 60,
    backgroundColor: colors.navy,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  coverTitle: {
    fontSize: 28,
    color: colors.white,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    color: colors.green,
    marginBottom: 40,
  },
  coverOrgName: {
    fontSize: 20,
    color: colors.white,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  coverUseCase: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  coverFooter: {
    position: "absolute",
    bottom: 60,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 12,
  },
  // Content
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 10,
    marginTop: 20,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
  },
  h3: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 6,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 6,
    color: "#374151",
  },
  label: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  col2: {
    width: "50%",
  },
  col3: {
    width: "33.33%",
  },
  // Tables
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.navy,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tableCell: {
    fontSize: 9,
    paddingHorizontal: 4,
  },
  // Badges
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  badgeRed: {
    backgroundColor: "#FEE2E2",
    color: colors.red,
  },
  badgeAmber: {
    backgroundColor: "#FEF3C7",
    color: colors.amber,
  },
  badgeGreen: {
    backgroundColor: "#D1FAE5",
    color: "#059669",
  },
  // Score bar
  scoreBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    flex: 1,
  },
  scoreBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  // Bullet
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 4,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.navy,
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    fontSize: 9,
    flex: 1,
    lineHeight: 1.4,
  },
  // Phase
  phaseBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  phaseName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  phaseDuration: {
    fontSize: 9,
    color: colors.gray,
  },
  // Footer
  pageFooter: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function getRiskBadgeStyle(category: string) {
  const c = category.toLowerCase();
  if (c.includes("prohibited") || c.includes("high")) return styles.badgeRed;
  if (c.includes("limited") || c.includes("amber")) return styles.badgeAmber;
  return styles.badgeGreen;
}

interface AssessmentData {
  orgName?: string;
  industry?: string;
  orgSize?: string;
  employeeCount?: number;
  regulatoryFrameworks?: string[];
  jurisdiction?: string[];
  existingAIMaturity?: string;
  useCaseTitle?: string;
  useCaseDescription?: string;
  useCaseCategory?: string;
  dataTypes?: string[];
  dataVolume?: string;
  currentProcess?: string;
  expectedOutcome?: string;
  estimatedUsers?: number;
  vendorScores?: Array<{
    vendorName: string;
    overallScore: number;
    securityScore: number;
    complianceScore: number;
    functionalityScore: number;
    integrationScore: number;
    costScore: number;
    riskFlags: string[];
    recommendation: string;
  }>;
  aiActRiskCategory?: string;
  aiActObligations?: string[];
  dpiaRequired?: boolean;
  dpiaTriggeredCriteria?: string[];
  doraApplicable?: boolean;
  doraObligations?: string[];
  complianceGaps?: string[];
  complianceScore?: number;
  phases?: Array<{
    phaseName: string;
    duration: string;
    keyActivities: string[];
    deliverables: string[];
    risks: string[];
    successCriteria: string[];
  }>;
  totalTimeline?: string;
  estimatedBudgetRange?: string;
  overallRiskScore?: number;
  riskCategories?: Array<{
    category: string;
    score: number;
    details: string;
    mitigations: string[];
  }>;
}

export function AssessmentPDF({ data }: { data: AssessmentData }) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>AI IMPLEMENTATION COMPASS</Text>
        <Text style={styles.coverSubtitle}>
          Enterprise AI Assessment Report
        </Text>
        <Text style={styles.coverOrgName}>{data.orgName || "Organization"}</Text>
        <Text style={styles.coverUseCase}>
          {data.useCaseTitle || "AI Use Case Assessment"}
        </Text>
        <Text style={styles.coverMeta}>Prepared: {date}</Text>
        <Text style={styles.coverMeta}>Classification: CONFIDENTIAL</Text>
        <View style={styles.coverFooter}>
          <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
            Powered by AI Implementation Compass
          </Text>
        </View>
      </Page>

      {/* EXECUTIVE SUMMARY + ORG CONTEXT */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Executive Summary</Text>
        <Text style={styles.paragraph}>
          This report presents a comprehensive AI implementation assessment for{" "}
          {data.orgName}, a {data.orgSize?.replace("_", " ")} {data.industry}{" "}
          organization with {data.employeeCount} employees. The assessment
          covers vendor evaluation, regulatory compliance (EU AI Act, GDPR,
          DORA), and a phased implementation roadmap for the proposed AI use
          case: {data.useCaseTitle}.
        </Text>
        <View style={styles.row}>
          <View style={styles.col3}>
            <Text style={styles.label}>Overall Risk Score</Text>
            <Text style={styles.value}>{data.overallRiskScore ?? "N/A"}/100</Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.label}>Compliance Score</Text>
            <Text style={styles.value}>{data.complianceScore ?? "N/A"}/100</Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.label}>Timeline</Text>
            <Text style={styles.value}>{data.totalTimeline || "N/A"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. Organization Context</Text>
        <View style={styles.row}>
          <View style={styles.col2}>
            <Text style={styles.label}>Organization</Text>
            <Text style={styles.value}>{data.orgName}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.value}>{data.industry}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col2}>
            <Text style={styles.label}>Size</Text>
            <Text style={styles.value}>
              {data.orgSize?.replace("_", " ")} ({data.employeeCount} employees)
            </Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>AI Maturity</Text>
            <Text style={styles.value}>{data.existingAIMaturity}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col2}>
            <Text style={styles.label}>Regulatory Frameworks</Text>
            <Text style={styles.value}>
              {data.regulatoryFrameworks?.join(", ")}
            </Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Jurisdiction</Text>
            <Text style={styles.value}>{data.jurisdiction?.join(", ")}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>3. AI Use Case Analysis</Text>
        <Text style={styles.label}>Use Case</Text>
        <Text style={styles.value}>{data.useCaseTitle}</Text>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{data.useCaseCategory?.replace("_", " ")}</Text>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.paragraph}>{data.useCaseDescription}</Text>
        <View style={styles.row}>
          <View style={styles.col2}>
            <Text style={styles.label}>Data Types</Text>
            <Text style={styles.value}>{data.dataTypes?.join(", ")}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Data Volume</Text>
            <Text style={styles.value}>{data.dataVolume}</Text>
          </View>
        </View>

        <View style={styles.pageFooter}>
          <Text>AI Implementation Compass — Confidential</Text>
          <Text>Page 2</Text>
        </View>
      </Page>

      {/* VENDOR EVALUATION */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>4. Vendor Evaluation Results</Text>

        {data.vendorScores && data.vendorScores.length > 0 && (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: "22%" }]}>Vendor</Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>Overall</Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>Security</Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>Compliance</Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>Function</Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>Integr.</Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>Cost</Text>
            </View>
            {data.vendorScores.map((v, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "22%", fontFamily: "Helvetica-Bold" }]}>
                  {v.vendorName}
                </Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{v.overallScore}</Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{v.securityScore}</Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{v.complianceScore}</Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{v.functionalityScore}</Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{v.integrationScore}</Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{v.costScore}</Text>
              </View>
            ))}
          </View>
        )}

        {data.vendorScores?.map((v, i) => (
          <View key={i} style={{ marginTop: 8 }}>
            <Text style={styles.h3}>{v.vendorName}</Text>
            <Text style={styles.paragraph}>{v.recommendation}</Text>
            {v.riskFlags.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                {v.riskFlags.map((f, j) => (
                  <Text key={j} style={[styles.badge, getRiskBadgeStyle(f)]}>
                    {f}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.pageFooter}>
          <Text>AI Implementation Compass — Confidential</Text>
          <Text>Page 3</Text>
        </View>
      </Page>

      {/* COMPLIANCE */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>5. Compliance Assessment</Text>

        <Text style={styles.h3}>EU AI Act Classification</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Text style={styles.label}>Risk Category:</Text>
          <Text
            style={[
              styles.badge,
              getRiskBadgeStyle(data.aiActRiskCategory || "minimal"),
            ]}
          >
            {data.aiActRiskCategory?.replace("_", " ").toUpperCase() || "N/A"}
          </Text>
        </View>
        {data.aiActObligations && data.aiActObligations.length > 0 && (
          <View>
            <Text style={styles.label}>Obligations:</Text>
            <BulletList items={data.aiActObligations} />
          </View>
        )}

        <Text style={styles.h3}>GDPR DPIA Assessment</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Text style={styles.label}>DPIA Required:</Text>
          <Text style={[styles.badge, data.dpiaRequired ? styles.badgeRed : styles.badgeGreen]}>
            {data.dpiaRequired ? "YES" : "NO"}
          </Text>
        </View>
        {data.dpiaTriggeredCriteria && data.dpiaTriggeredCriteria.length > 0 && (
          <View>
            <Text style={styles.label}>
              Triggered Criteria ({data.dpiaTriggeredCriteria.length} of 9):
            </Text>
            <BulletList items={data.dpiaTriggeredCriteria} />
          </View>
        )}

        <Text style={styles.h3}>DORA Assessment</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Text style={styles.label}>Applicable:</Text>
          <Text style={[styles.badge, data.doraApplicable ? styles.badgeAmber : styles.badgeGreen]}>
            {data.doraApplicable ? "YES" : "NO"}
          </Text>
        </View>
        {data.doraObligations && data.doraObligations.length > 0 && (
          <BulletList items={data.doraObligations} />
        )}

        {data.complianceGaps && data.complianceGaps.length > 0 && (
          <View>
            <Text style={styles.h3}>Compliance Gaps</Text>
            <BulletList items={data.complianceGaps} />
          </View>
        )}

        <View style={styles.pageFooter}>
          <Text>AI Implementation Compass — Confidential</Text>
          <Text>Page 4</Text>
        </View>
      </Page>

      {/* ROADMAP */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>6. Implementation Roadmap</Text>
        <View style={styles.row}>
          <View style={styles.col3}>
            <Text style={styles.label}>Total Timeline</Text>
            <Text style={styles.value}>{data.totalTimeline || "N/A"}</Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.label}>Est. Budget</Text>
            <Text style={styles.value}>{data.estimatedBudgetRange || "N/A"}</Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.label}>Risk Score</Text>
            <Text style={styles.value}>{data.overallRiskScore ?? "N/A"}/100</Text>
          </View>
        </View>

        {data.phases?.map((phase, i) => (
          <View key={i} style={styles.phaseBox}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseName}>
                Phase {i + 1}: {phase.phaseName}
              </Text>
              <Text style={styles.phaseDuration}>{phase.duration}</Text>
            </View>
            {phase.keyActivities.length > 0 && (
              <View>
                <Text style={[styles.label, { marginTop: 4 }]}>Key Activities:</Text>
                <BulletList items={phase.keyActivities} />
              </View>
            )}
            {phase.deliverables.length > 0 && (
              <View>
                <Text style={[styles.label, { marginTop: 4 }]}>Deliverables:</Text>
                <BulletList items={phase.deliverables} />
              </View>
            )}
          </View>
        ))}

        <View style={styles.pageFooter}>
          <Text>AI Implementation Compass — Confidential</Text>
          <Text>Page 5</Text>
        </View>
      </Page>

      {/* RISK ANALYSIS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>7. Risk Analysis</Text>

        {data.riskCategories && data.riskCategories.length > 0 && (
          <View>
            {data.riskCategories.map((cat, i) => (
              <View key={i} style={styles.phaseBox}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={[styles.value, { marginBottom: 0 }]}>{cat.category}</Text>
                  <Text
                    style={[
                      styles.badge,
                      cat.score >= 70
                        ? styles.badgeRed
                        : cat.score >= 40
                          ? styles.badgeAmber
                          : styles.badgeGreen,
                    ]}
                  >
                    {cat.score}/100
                  </Text>
                </View>
                <Text style={styles.paragraph}>{cat.details}</Text>
                {cat.mitigations.length > 0 && (
                  <View>
                    <Text style={styles.label}>Mitigations:</Text>
                    <BulletList items={cat.mitigations} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>8. Appendix: Regulatory Reference</Text>
        <Text style={styles.paragraph}>
          EU AI Act (Regulation 2024/1689) — High-risk deadline: 2 August 2026.
          Articles referenced: Art. 5 (prohibited), Art. 6 & Annex III
          (high-risk classification), Arts. 8-15 (high-risk obligations), Art.
          43 (conformity assessment), Art. 99 (penalties).
        </Text>
        <Text style={styles.paragraph}>
          GDPR (Regulation 2016/679) — DPIA requirements per Art. 35, EDPB
          WP248 rev.01 nine criteria. CNIL position on foundation models.
        </Text>
        <Text style={styles.paragraph}>
          DORA (Regulation 2022/2554) — Fully enforceable since 17 January
          2025. Arts. 28-30 on ICT third-party risk management. Register of
          Information obligations.
        </Text>

        <View style={styles.pageFooter}>
          <Text>AI Implementation Compass — Confidential</Text>
          <Text>Page 6</Text>
        </View>
      </Page>
    </Document>
  );
}
