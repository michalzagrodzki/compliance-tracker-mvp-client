/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import { normalizeError } from "@/lib/error";
import type {
  ComplianceGapResponse,
  ComplianceGapFromChatHistoryRequest,
  ComplianceGapAssignment,
  ComplianceGapReview,
  ComplianceGapStatusUpdate,
  ComplianceGapUpdate,
  ComplianceRecommendationRequest,
  ComplianceRecommendationResponse,
  ChatHistoryItem,
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  DetectionMethod,
} from "../types";

const ENDPOINTS = {
  COMPLIANCE_GAPS: "/v1/compliance-gaps",
  COMPLIANCE_GAPS_BY_ID: (id: string) => `/v1/compliance-gaps/${id}`,
  COMPLIANCE_GAPS_BY_DOMAINS: "/v1/compliance-gaps/compliance-domains",
  COMPLIANCE_GAPS_STATUS: (id: string) => `/v1/compliance-gaps/${id}/status`,
  COMPLIANCE_GAPS_ASSIGN: (id: string) => `/v1/compliance-gaps/${id}/assign`,
  COMPLIANCE_GAPS_REVIEW: (id: string) => `/v1/compliance-gaps/${id}/review`,
  COMPLIANCE_RECOMMENDATION: "/v1/compliance-gaps/recommendation",
  AUDIT_SESSION_GAPS: (sessionId: string) =>
    `/v1/audit-sessions/${sessionId}/gaps`,
  CHAT_HISTORY_ITEM: (id: string) => `/v1/history/item/${id}`,
} as const;

interface ComplianceGapListParams {
  skip?: number;
  limit?: number;
  compliance_domain?: string;
  gap_type?: string;
  risk_level?: string;
  status?: string;
  audit_session_id?: string;
  assigned_to?: string;
  created_after?: string;
  created_before?: string;
}

interface ComplianceGapDirectRequest {
  user_id: string;
  audit_session_id: string;
  compliance_domain: string;
  gap_type: GapType;
  gap_category: string;
  gap_title: string;
  gap_description: string;
  original_question: string;
  creation_method: "direct";
  chat_history_id?: number;
  pdf_ingestion_id?: string;
  expected_answer_type?: string;
  search_terms_used: string[];
  similarity_threshold_used: number;
  best_match_score: number;
  risk_level: RiskLevel;
  business_impact: BusinessImpactLevel;
  regulatory_requirement: boolean;
  potential_fine_amount: number;
  recommendation_type?: RecommendationType;
  recommendation_text: string;
  recommended_actions: string[];
  related_documents: string[];
  detection_method: DetectionMethod;
  confidence_score: number;
  false_positive_likelihood: number;
  session_context: Record<string, any>;
  iso_control: string | null;
}

class ComplianceGapService {
  async createFromChatHistory(
    request: ComplianceGapFromChatHistoryRequest
  ): Promise<ComplianceGapResponse> {
    try {
      const response = await http.post<ComplianceGapResponse>(
        ENDPOINTS.COMPLIANCE_GAPS,
        request
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createDirect(
    request: ComplianceGapDirectRequest
  ): Promise<ComplianceGapResponse> {
    try {
      const response = await http.post<ComplianceGapResponse>(
        ENDPOINTS.COMPLIANCE_GAPS,
        request
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async generateRecommendation(
    request: ComplianceRecommendationRequest
  ): Promise<ComplianceRecommendationResponse> {
    try {
      const response = await http.post<ComplianceRecommendationResponse>(
        ENDPOINTS.COMPLIANCE_RECOMMENDATION,
        request
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getChatHistoryItem(chatHistoryId: string): Promise<ChatHistoryItem> {
    try {
      const response = await http.get<ChatHistoryItem>(
        ENDPOINTS.CHAT_HISTORY_ITEM(chatHistoryId)
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getComplianceGaps(
    params: ComplianceGapListParams = {}
  ): Promise<ComplianceGapResponse[]> {
    try {
      const response = await http.get<ComplianceGapResponse[]>(
        ENDPOINTS.COMPLIANCE_GAPS,
        {
          params: {
            skip: params.skip || 0,
            limit: params.limit || 50,
            ...params,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getComplianceGapsByUserComplianceDomains(
    params: {
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<ComplianceGapResponse[]> {
    try {
      const response = await http.get<ComplianceGapResponse[]>(
        ENDPOINTS.COMPLIANCE_GAPS_BY_DOMAINS,
        {
          params: {
            skip: params.skip || 0,
            limit: params.limit || 50,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getComplianceGapById(id: string): Promise<ComplianceGapResponse> {
    try {
      const response = await http.get<ComplianceGapResponse>(
        ENDPOINTS.COMPLIANCE_GAPS_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getGapsByAuditSession(
    sessionId: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<ComplianceGapResponse[]> {
    try {
      const response = await http.get<ComplianceGapResponse[]>(
        ENDPOINTS.AUDIT_SESSION_GAPS(sessionId),
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async updateComplianceGap(
    gapId: string,
    updateData: ComplianceGapUpdate
  ): Promise<ComplianceGapResponse> {
    try {
      const response = await http.patch<ComplianceGapResponse>(
        ENDPOINTS.COMPLIANCE_GAPS_BY_ID(gapId),
        updateData
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async updateComplianceGapStatus(
    gapId: string,
    statusData: ComplianceGapStatusUpdate
  ): Promise<ComplianceGapResponse> {
    try {
      const response = await http.put<ComplianceGapResponse>(
        ENDPOINTS.COMPLIANCE_GAPS_STATUS(gapId),
        statusData
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async assignComplianceGap(
    gapId: string,
    assignmentData: ComplianceGapAssignment
  ): Promise<ComplianceGapResponse> {
    try {
      const response = await http.put<ComplianceGapResponse>(
        ENDPOINTS.COMPLIANCE_GAPS_ASSIGN(gapId),
        assignmentData
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async reviewComplianceGap(
    gapId: string,
    reviewData: ComplianceGapReview
  ): Promise<ComplianceGapResponse> {
    try {
      const response = await http.put<ComplianceGapResponse>(
        ENDPOINTS.COMPLIANCE_GAPS_REVIEW(gapId),
        reviewData
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Utility methods for form assistance
   */
  analyzeMessageForGapType(message: string): {
    suggestedType: GapType;
    confidence: number;
  } {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("missing") ||
      lowerMessage.includes("not found") ||
      lowerMessage.includes("absent")
    ) {
      return { suggestedType: "missing_policy", confidence: 0.8 };
    }

    if (
      lowerMessage.includes("old") ||
      lowerMessage.includes("outdated") ||
      lowerMessage.includes("obsolete")
    ) {
      return { suggestedType: "outdated_policy", confidence: 0.7 };
    }

    if (
      lowerMessage.includes("conflict") ||
      lowerMessage.includes("contradict")
    ) {
      return { suggestedType: "conflicting_policies", confidence: 0.8 };
    }

    if (
      lowerMessage.includes("incomplete") ||
      lowerMessage.includes("partial")
    ) {
      return { suggestedType: "incomplete_coverage", confidence: 0.7 };
    }

    if (
      lowerMessage.includes("no evidence") ||
      lowerMessage.includes("no documentation")
    ) {
      return { suggestedType: "no_evidence", confidence: 0.8 };
    }

    return { suggestedType: "missing_policy", confidence: 0.5 };
  }

  suggestGapCategory(domain: string): string {
    const domainMappings: Record<string, string> = {
      iso27001: "ISO 27001 Information Security",
      gdpr: "GDPR Data Protection",
      sox: "SOX Financial Controls",
      hipaa: "HIPAA Healthcare Privacy",
      pci: "PCI Payment Security",
    };

    return domainMappings[domain.toLowerCase()] || "General Compliance";
  }

  extractSearchTerms(message: string): string[] {
    const commonWords = [
      "the",
      "is",
      "at",
      "which",
      "on",
      "a",
      "an",
      "and",
      "or",
      "but",
    ];
    return message
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10);
  }
}

export const complianceGapService = new ComplianceGapService();
