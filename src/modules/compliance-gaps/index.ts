// src/modules/compliance-gaps/index.ts

export { ComplianceGapForm } from "./components/ComplianceGapForm";
export { ComplianceGapModal } from "./components/ComplianceGapModal";

export { complianceGapService } from "./services/complianceGapService";

export { useComplianceGapStore } from "./store/complianceGapStore";
export { useComplianceGap } from "./hooks/useComplianceGap";

export type {
  ComplianceGapFromChatHistoryRequest,
  ComplianceGapResponse,
  ComplianceGapFormData,
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
} from "./types/index";

export {
  GAP_TYPE_OPTIONS,
  RISK_LEVEL_OPTIONS,
  BUSINESS_IMPACT_OPTIONS,
  RECOMMENDATION_TYPE_OPTIONS,
} from "./types/index";
