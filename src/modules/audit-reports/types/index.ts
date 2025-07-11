/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  GapType,
  BusinessImpactLevel,
  RecommendationType,
} from "@/modules/compliance-gaps";

export type ReportType =
  | "compliance_audit"
  | "gap_analysis"
  | "regulatory_review"
  | "external_audit"
  | "internal_review";

export type TargetAudience =
  | "executives"
  | "compliance_team"
  | "auditors"
  | "regulators";

export type ConfidentialityLevel =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

export interface AuditReport {
  id: string;
  user_id: string;
  audit_session_id: string;
  compliance_domain: string;
  report_title: string;
  report_type: ReportType;
  chat_history_ids: number[];
  compliance_gap_ids: string[];
  document_ids: string[];
  pdf_ingestion_ids: string[];
  include_technical_details: boolean;
  include_source_citations: boolean;
  include_confidence_scores: boolean;
  target_audience: TargetAudience;
  template_used?: string;
  confidentiality_level: ConfidentialityLevel;
  external_auditor_access: boolean;
  created_at: string;
  updated_at: string;
  report_status?: string;
  download_url?: string;
}

export interface AuditReportCreate {
  // Core relationships
  user_id: string;
  audit_session_id: string;
  compliance_domain: string;

  // Report metadata
  report_title: string;
  report_type: ReportType;

  // Session data references
  chat_history_ids: number[];
  compliance_gap_ids: string[];
  document_ids: string[];
  pdf_ingestion_ids: string[];

  // Report generation settings
  include_technical_details: boolean;
  include_source_citations: boolean;
  include_confidence_scores: boolean;
  target_audience: TargetAudience;
  template_used?: string;
  confidentiality_level: ConfidentialityLevel;
  external_auditor_access: boolean;

  // Optional fields with defaults that backend should handle
  report_status?: string;
  total_questions_asked?: number;
  questions_answered_satisfactorily?: number;
  total_gaps_identified?: number;
  critical_gaps_count?: number;
  high_risk_gaps_count?: number;
  medium_risk_gaps_count?: number;
  low_risk_gaps_count?: number;
}

export interface AuditReportResponse {
  success: boolean;
  message: string;
  report_id?: string;
  download_url?: string;
  error?: string;
}

export interface AuditReportState {
  reports: AuditReport[];
  currentReport: AuditReport | null;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createResponse: AuditReportResponse | null;
}

export interface AuditReportActions {
  createReport: (reportData: AuditReportCreate) => Promise<AuditReportResponse>;
  fetchReports: (
    userId?: string,
    skip?: number,
    limit?: number
  ) => Promise<void>;
  fetchReportById: (reportId: string) => Promise<void>;
  clearError: () => void;
  clearCreateResponse: () => void;
  setLoading: (loading: boolean) => void;
}

// Available options for form dropdowns
export const REPORT_TYPE_OPTIONS: Array<{
  value: ReportType;
  label: string;
  description: string;
}> = [
  {
    value: "compliance_audit",
    label: "Compliance Audit Report",
    description: "Comprehensive compliance assessment and findings",
  },
  {
    value: "gap_analysis",
    label: "Gap Analysis Report",
    description: "Analysis of compliance gaps and remediation plans",
  },
  {
    value: "regulatory_review",
    label: "Regulatory Review Report",
    description: "Review of regulatory requirements and adherence",
  },
  {
    value: "external_audit",
    label: "External Audit Report",
    description: "Report prepared for external auditor review",
  },
  {
    value: "internal_review",
    label: "Internal Review Report",
    description: "Internal assessment and monitoring report",
  },
];

export const TARGET_AUDIENCE_OPTIONS: Array<{
  value: TargetAudience;
  label: string;
  description: string;
}> = [
  {
    value: "executives",
    label: "Executive Leadership",
    description: "C-suite executives and senior management",
  },
  {
    value: "compliance_team",
    label: "Compliance Team",
    description: "Compliance officers and risk management teams",
  },
  {
    value: "auditors",
    label: "Auditors",
    description: "Internal and external auditing teams",
  },
  {
    value: "regulators",
    label: "Regulatory Bodies",
    description: "Government agencies and regulatory authorities",
  },
];

export const CONFIDENTIALITY_LEVEL_OPTIONS: Array<{
  value: ConfidentialityLevel;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: "public",
    label: "Public",
    description: "Can be shared publicly without restrictions",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "internal",
    label: "Internal",
    description: "For internal organizational use only",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "confidential",
    label: "Confidential",
    description: "Restricted to authorized personnel only",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "restricted",
    label: "Restricted",
    description: "Highest level of confidentiality required",
    color: "bg-red-100 text-red-800",
  },
];

// Helper interfaces for data selection
export interface ChatHistoryItem {
  id: number;
  message: string;
  timestamp: string;
  user_message: string;
  ai_response: string;
  selected?: boolean;
}

export interface ComplianceGapItem {
  id: string;
  gap_title: string;
  gap_type: GapType;
  risk_level: string;
  gap_description: string;
  selected?: boolean;
  business_impact: BusinessImpactLevel;
  gap_category: string;
  confidence_score: number;
  potential_fine_amount: number | null;
  detection_method: string;
  recommendation_text?: string;
  recommended_actions: string[];
  recommendation_type?: RecommendationType;
  regulatory_requirement?: boolean;
  detected_at: string;
  false_positive_likelihood: number;
}

export interface DocumentItem {
  id: string;
  filename: string;
  upload_date: string;
  file_size?: number;
  selected?: boolean;
}

export interface ReportDataSources {
  chatHistory: ChatHistoryItem[];
  complianceGaps: ComplianceGapItem[];
  documents: DocumentItem[];
  isLoadingChats: boolean;
  isLoadingGaps: boolean;
  isLoadingDocuments: boolean;
}
