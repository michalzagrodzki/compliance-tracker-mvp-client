// src/modules/compliance-gaps/types/index.ts

export interface ComplianceGapFromChatHistoryRequest {
  creation_method: "from_chat_history";
  chat_history_id: string;

  gap_type: GapType;
  gap_category: string;
  gap_title: string;
  gap_description: string;

  audit_session_id?: string;
  compliance_domain?: string;
  search_terms_used?: string[];

  risk_level: RiskLevel;
  business_impact: BusinessImpactLevel;
  regulatory_requirement: boolean;
  potential_fine_amount?: number;

  recommendation_type?: RecommendationType;
  recommendation_text?: string;
  recommended_actions?: string[];
  related_documents?: string[];

  confidence_score: number;
  false_positive_likelihood: number;
}

export type GapType =
  | "missing_policy"
  | "outdated_policy"
  | "low_confidence"
  | "conflicting_policies"
  | "incomplete_coverage"
  | "no_evidence";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type BusinessImpactLevel = "low" | "medium" | "high" | "critical";

export type RecommendationType =
  | "create_policy"
  | "update_policy"
  | "upload_document"
  | "training_needed"
  | "process_improvement"
  | "system_configuration";

export interface ComplianceGapResponse {
  id: string;
  gap_title: string;
  gap_type: GapType;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceGapFormData {
  gap_type: GapType;
  gap_category: string;
  gap_title: string;
  gap_description: string;
  risk_level: RiskLevel;
  business_impact: BusinessImpactLevel;
  regulatory_requirement: boolean;
  potential_fine_amount?: number;
  recommendation_type?: RecommendationType;
  recommendation_text?: string;
  recommended_actions: string[];
  confidence_score: number;
  false_positive_likelihood: number;
}

export const GAP_TYPE_OPTIONS: Array<{
  value: GapType;
  label: string;
  description: string;
}> = [
  {
    value: "missing_policy",
    label: "Missing Policy",
    description: "Required policy or procedure is completely absent",
  },
  {
    value: "outdated_policy",
    label: "Outdated Policy",
    description: "Existing policy is obsolete or out of date",
  },
  {
    value: "low_confidence",
    label: "Low Confidence",
    description: "Available information has low confidence level",
  },
  {
    value: "conflicting_policies",
    label: "Conflicting Policies",
    description: "Multiple policies provide contradictory guidance",
  },
  {
    value: "incomplete_coverage",
    label: "Incomplete Coverage",
    description: "Policy exists but does not cover all required areas",
  },
  {
    value: "no_evidence",
    label: "No Evidence",
    description: "No documentation found to support compliance",
  },
];

export const RISK_LEVEL_OPTIONS: Array<{
  value: RiskLevel;
  label: string;
  color: string;
}> = [
  {
    value: "low",
    label: "Low",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  {
    value: "high",
    label: "High",
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  {
    value: "critical",
    label: "Critical",
    color: "text-red-600 bg-red-50 border-red-200",
  },
];

export const BUSINESS_IMPACT_OPTIONS: Array<{
  value: BusinessImpactLevel;
  label: string;
}> = [
  { value: "low", label: "Low Impact" },
  { value: "medium", label: "Medium Impact" },
  { value: "high", label: "High Impact" },
  { value: "critical", label: "Critical Impact" },
];

export const RECOMMENDATION_TYPE_OPTIONS: Array<{
  value: RecommendationType;
  label: string;
}> = [
  { value: "create_policy", label: "Create New Policy" },
  { value: "update_policy", label: "Update Existing Policy" },
  { value: "upload_document", label: "Upload Documentation" },
  { value: "training_needed", label: "Training Required" },
  { value: "process_improvement", label: "Process Improvement" },
  { value: "system_configuration", label: "System Configuration" },
];
