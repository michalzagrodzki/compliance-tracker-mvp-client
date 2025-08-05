/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  GapType,
  BusinessImpactLevel,
  RecommendationType,
} from "@/modules/compliance-gaps";
import type { ComplianceGap } from "@/modules/compliance-gaps/types";

export type ReportType =
  | "compliance_audit"
  | "gap_analysis"
  | "regulatory_review"
  | "external_audit"
  | "internal_review";

export type ReportStatus =
  | "draft"
  | "finalized"
  | "approved"
  | "distributed"
  | "archived";

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

export type OverallComplianceRating =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "critical";

export const SummaryType = {
  STANDARD: "standard",
  DETAILED: "detailed",
  BRIEF: "brief",
} as const;

export type SummaryTypeValue = (typeof SummaryType)[keyof typeof SummaryType];

export type TrendingDirection = "improving" | "stable" | "declining";

export interface DetailedFinding {
  id?: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  recommendation: string;
  source_references?: string[];
}

export interface Recommendation {
  id?: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimated_effort: string;
  category: string;
}

export interface ActionItem {
  id?: string;
  title: string;
  description: string;
  assigned_to?: string;
  due_date?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
}

export interface AuditTrailEntry {
  timestamp: string;
  user_id: string;
  action: string;
  details: string;
  ip_address?: string;
}
export interface AuditReport {
  id: string;
  user_id: string;
  audit_session_id: string;
  compliance_domain: string;
  report_title: string;
  report_type: ReportType;
  report_status: ReportStatus;
  chat_history_ids: number[];
  compliance_gap_ids: string[];
  document_ids: string[];
  pdf_ingestion_ids: string[];
  total_questions_asked: number;
  questions_answered_satisfactorily: number;
  total_gaps_identified: number;
  critical_gaps_count: number;
  high_risk_gaps_count: number;
  medium_risk_gaps_count: number;
  low_risk_gaps_count: number;
  requirements_total: number | null;
  requirements_covered: number | null;
  coverage_percentage: number | null;
  policy_documents_referenced: number;
  unique_sources_count: number;
  session_duration_minutes: number | null;
  avg_response_time_ms: number | null;
  total_tokens_used: number | null;
  total_similarity_searches: number | null;
  avg_confidence_score: number | null;
  low_confidence_answers_count: number;
  contradictory_findings_count: number;
  outdated_references_count: number;
  overall_compliance_rating: OverallComplianceRating | null;
  estimated_remediation_cost: number | null;
  estimated_remediation_time_days: number | null;
  regulatory_risk_score: number | null; // 1-10 scale
  potential_fine_exposure: number | null;
  executive_summary: string | null;
  control_risk_prioritization: string | null;
  threat_intelligence_analysis: string | null;
  target_audience_summary: string | null;
  detailed_findings: DetailedFinding[] | Record<string, any>;
  recommendations: Recommendation[];
  action_items: ActionItem[];
  appendices: Record<string, any> | null;
  template_used: string | null;
  include_technical_details: boolean;
  include_source_citations: boolean;
  include_confidence_scores: boolean;
  target_audience: TargetAudience;
  generated_by: string | null;
  reviewed_by: string | null;
  approved_by: string | null;
  distributed_to: string[];
  external_auditor_access: boolean;
  confidentiality_level: ConfidentialityLevel;
  audit_trail: AuditTrailEntry[];
  external_audit_reference: string | null;
  regulatory_submission_date: string | null;
  regulatory_response_received: boolean;
  report_file_path: string | null;
  report_file_size: number | null;
  report_hash: string | null;
  export_formats: string[];
  previous_report_id: string | null;
  improvement_from_previous: number | null;
  trending_direction: TrendingDirection | null;
  benchmark_comparison: Record<string, any> | null;
  scheduled_followup_date: string | null;
  auto_generated: boolean;
  integration_exports: Record<string, any>;
  notification_sent: boolean;
  report_generated_at: string;
  report_finalized_at: string | null;
  last_modified_at: string;
  created_at: string;
  updated_at: string;
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

  // Report summaries
  executive_summary?: string;
  control_risk_prioritization?: string;
  threat_intelligence_analysis?: string;
  target_audience_summary?: string;

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
  isUpdating: boolean;
  updateError: string | null;
  error: string | null;
  isCreating: boolean;
  createResponse: AuditReportResponse | null;
  isGeneratingSummary: boolean;
  isGenerating: boolean;
  generateResponse: AuditReportGenerateResponse | null;
  generateError: string | null;
}

export interface AuditReportActions {
  createReport: (reportData: AuditReportCreate) => Promise<AuditReportResponse>;
  updateReport: (
    reportId: string,
    updateData: Partial<AuditReport>,
    changeDescription?: string
  ) => Promise<void>;
  clearUpdateError: () => void;
  fetchReports: () => Promise<void>;
  fetchReportById: (reportId: string) => Promise<void>;
  clearError: () => void;
  clearCreateResponse: () => void;
  setLoading: (loading: boolean) => void;

  generateAuditReport: (
    generateRequest: AuditReportGenerateRequest
  ) => Promise<AuditReportGenerateResponse>;
  clearGenerateResponse: () => void;
  clearGenerateError: () => void;
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

export const COMPLIANCE_RATING_OPTIONS: Array<{
  value: OverallComplianceRating;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: "excellent",
    label: "Excellent",
    description: "Exceeds all compliance requirements",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    value: "good",
    label: "Good",
    description: "Meets most compliance requirements with minor gaps",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "fair",
    label: "Fair",
    description: "Meets basic requirements but has notable gaps",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "poor",
    label: "Poor",
    description: "Significant compliance gaps requiring attention",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Major compliance failures requiring immediate action",
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

export interface ExecutiveSummaryRequest {
  audit_report: AuditReportCreate;
  compliance_gaps: ComplianceGap[];
  summary_type?: SummaryTypeValue;
}

export interface ExecutiveSummaryResponse {
  executive_summary: string;
  audit_session_id: string;
  compliance_domain: string;
  total_gaps: number;
  high_risk_gaps: number;
  medium_risk_gaps: number;
  low_risk_gaps: number;
  regulatory_gaps: number;
  potential_financial_impact: number;
  generation_metadata: Record<string, any>;
}

export interface AuditReportGenerateRequest {
  audit_session_id: string;
  report_title: string;
  report_type: ReportType;

  // Generation options
  include_all_conversations: boolean;
  include_identified_gaps: boolean;
  include_document_references: boolean;
  generate_recommendations: boolean;

  // Report configuration
  include_technical_details: boolean;
  include_source_citations: boolean;
  include_confidence_scores: boolean;
  target_audience: TargetAudience;

  // Distribution settings
  confidentiality_level: ConfidentialityLevel;
  auto_distribute: boolean;
  distribution_list?: string[];
}

export interface AuditReportGenerateResponse {
  success: boolean;
  message: string;
  report_id?: string;
  download_url?: string;
  error?: string;
  generation_status?: "started" | "completed" | "failed";
}

export const generateReportTitle = (
  complianceDomain: string,
  sessionDate?: string
): string => {
  const date = sessionDate ? new Date(sessionDate) : new Date();
  const year = date.getFullYear();
  const quarter = Math.floor((date.getMonth() + 3) / 3);

  return `${year} - Q${quarter} - ${complianceDomain} Compliance Audit`;
};

export const DEFAULT_GENERATE_REQUEST: Omit<
  AuditReportGenerateRequest,
  "audit_session_id" | "report_title"
> = {
  report_type: "compliance_audit",
  include_all_conversations: true,
  include_identified_gaps: true,
  include_document_references: true,
  generate_recommendations: true,
  include_technical_details: false,
  include_source_citations: true,
  include_confidence_scores: false,
  target_audience: "compliance_team",
  confidentiality_level: "internal",
  auto_distribute: false,
  distribution_list: undefined,
};
