/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/compliance-gaps/services/complianceGapService.ts

import { http } from "@/modules/api/http";
import type {
  ComplianceGapFromChatHistoryRequest,
  ComplianceGapResponse,
} from "../types";

const COMPLIANCE_GAP_ENDPOINTS = {
  CREATE: "/v1/compliance-gaps",
  LIST: "/v1/compliance-gaps",
  GET_BY_ID: (id: string) => `/v1/compliance-gaps/${id}`,
  GET_BY_AUDIT_SESSION: (sessionId: string) =>
    `/v1/audit-sessions/${sessionId}/gaps`,
} as const;

class ComplianceGapService {
  async createFromChatHistory(
    request: ComplianceGapFromChatHistoryRequest
  ): Promise<ComplianceGapResponse> {
    try {
      const response = await http.post<ComplianceGapResponse>(
        COMPLIANCE_GAP_ENDPOINTS.CREATE,
        request
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to create compliance gap"
      );
    }
  }

  async getComplianceGaps(params?: {
    skip?: number;
    limit?: number;
    compliance_domain?: string;
    gap_type?: string;
    risk_level?: string;
    status?: string;
  }): Promise<ComplianceGapResponse[]> {
    try {
      const response = await http.get<ComplianceGapResponse[]>(
        COMPLIANCE_GAP_ENDPOINTS.LIST,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch compliance gaps"
      );
    }
  }

  async getComplianceGapById(id: string): Promise<ComplianceGapResponse> {
    try {
      const response = await http.get<ComplianceGapResponse>(
        COMPLIANCE_GAP_ENDPOINTS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch compliance gap"
      );
    }
  }

  async getGapsByAuditSession(
    sessionId: string
  ): Promise<ComplianceGapResponse[]> {
    try {
      const response = await http.get<ComplianceGapResponse[]>(
        COMPLIANCE_GAP_ENDPOINTS.GET_BY_AUDIT_SESSION(sessionId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch audit session gaps"
      );
    }
  }

  // Helper method to extract keywords from a message
  extractSearchTerms(message: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "can",
      "may",
      "what",
      "how",
      "when",
      "where",
      "why",
      "who",
      "which",
      "that",
      "this",
      "these",
      "those",
      "a",
      "an",
    ]);

    return message
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.has(word))
      .filter((word) => /^[a-zA-Z]+$/.test(word)) // Only alphabetic words
      .slice(0, 10); // Limit to 10 terms
  }

  // Helper method to suggest gap category based on compliance domain
  suggestGapCategory(complianceDomain: string): string {
    const categoryMap: Record<string, string> = {
      ISO_27001: "Information Security",
    };

    return categoryMap[complianceDomain] || "General Compliance";
  }

  // Helper method to analyze message for potential gap type
  analyzeMessageForGapType(message: string): {
    suggestedType: string;
    confidence: number;
  } {
    const gapIndicators = {
      missing_policy: [
        "missing",
        "absent",
        "no policy",
        "not found",
        "unavailable",
      ],
      outdated_policy: [
        "outdated",
        "old",
        "expired",
        "obsolete",
        "previous version",
      ],
      low_confidence: ["uncertain", "unclear", "maybe", "possibly", "might"],
      conflicting_policies: [
        "conflict",
        "contradiction",
        "different",
        "inconsistent",
      ],
      incomplete_coverage: ["partial", "incomplete", "limited", "some areas"],
      no_evidence: [
        "no evidence",
        "no documentation",
        "not documented",
        "no proof",
      ],
    };

    const messageLower = message.toLowerCase();
    let bestMatch = { type: "missing_policy", score: 0 };

    Object.entries(gapIndicators).forEach(([type, indicators]) => {
      const score = indicators.reduce((acc, indicator) => {
        return acc + (messageLower.includes(indicator) ? 1 : 0);
      }, 0);

      if (score > bestMatch.score) {
        bestMatch = { type, score };
      }
    });

    return {
      suggestedType: bestMatch.type,
      confidence: Math.min(bestMatch.score * 0.2 + 0.5, 0.9), // Scale to 0.5-0.9 range
    };
  }
}

export const complianceGapService = new ComplianceGapService();
