/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import type {
  ComplianceGapResponse,
  ComplianceGapFromChatHistoryRequest,
  ComplianceGapAssignment,
  ComplianceGapReview,
  ComplianceGapStatusUpdate,
  ComplianceGapUpdate,
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  DetectionMethod,
} from "../types";

// Add interface for direct creation request
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
  ip_address?: string;
  user_agent: string;
  session_context: Record<string, any>;
}

class ComplianceGapService {
  private baseUrl = "/v1/compliance-gaps";
  private baseVersionUrl = "/v1";

  async createFromChatHistory(
    request: ComplianceGapFromChatHistoryRequest
  ): Promise<ComplianceGapResponse> {
    const response = await http.post(
      `${this.baseUrl}/from-chat-history`,
      request
    );
    return response.data;
  }

  // Add method for direct creation
  async createDirect(
    request: ComplianceGapDirectRequest
  ): Promise<ComplianceGapResponse> {
    const response = await http.post(this.baseUrl, request);
    return response.data;
  }

  async getComplianceGaps(params?: {
    skip?: number;
    limit?: number;
    compliance_domain?: string;
    gap_type?: string;
    risk_level?: string;
    status?: string;
  }): Promise<ComplianceGapResponse[]> {
    const response = await http.get(this.baseUrl, { params });
    return response.data;
  }

  async getComplianceGapById(id: string): Promise<ComplianceGapResponse> {
    const response = await http.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getGapsByAuditSession(
    sessionId: string
  ): Promise<ComplianceGapResponse[]> {
    const response = await http.get(
      `${this.baseVersionUrl}/audit-sessions/${sessionId}/gaps`
    );
    return response.data;
  }

  async updateComplianceGap(
    gapId: string,
    updateData: ComplianceGapUpdate
  ): Promise<ComplianceGapResponse> {
    const response = await http.patch(`${this.baseUrl}/${gapId}`, updateData);
    return response.data;
  }

  async updateComplianceGapStatus(
    gapId: string,
    statusData: ComplianceGapStatusUpdate
  ): Promise<ComplianceGapResponse> {
    const response = await http.patch(
      `${this.baseUrl}/${gapId}/status`,
      statusData
    );
    return response.data;
  }

  async assignComplianceGap(
    gapId: string,
    assignmentData: ComplianceGapAssignment
  ): Promise<ComplianceGapResponse> {
    const response = await http.patch(
      `${this.baseUrl}/${gapId}/assign`,
      assignmentData
    );
    return response.data;
  }

  async reviewComplianceGap(
    gapId: string,
    reviewData: ComplianceGapReview
  ): Promise<ComplianceGapResponse> {
    const response = await http.patch(
      `${this.baseUrl}/${gapId}/review`,
      reviewData
    );
    return response.data;
  }

  // Utility methods for form assistance
  analyzeMessageForGapType(message: string): {
    suggestedType: GapType;
    confidence: number;
  } {
    // Simple keyword-based analysis - in production this would be more sophisticated
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
    // Simple term extraction - remove common words and split
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
      .slice(0, 10); // Limit to 10 terms
  }
}

export const complianceGapService = new ComplianceGapService();
