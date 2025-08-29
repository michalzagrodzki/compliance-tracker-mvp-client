/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import { normalizeError } from "@/lib/error";
import {
  SummaryType,
  type AuditReport,
  type AuditReportCreate,
  type AuditReportGenerateRequest,
  type AuditReportGenerateResponse,
  type AuditReportResponse,
  type ChatHistoryItem,
  type ComplianceGapItem,
  type DocumentItem,
  type ExecutiveSummaryRequest,
  type ExecutiveSummaryResponse,
  type ThreatIntelligenceRequest,
  type ThreatIntelligenceResponse,
  type RiskPrioritizationRequest,
  type RiskPrioritizationResponse,
  type TargetAudienceRequest,
  type TargetAudienceResponse,
  type SummaryTypeValue,
  type AuditReportActionItem,
  type AuditReportRecommendation,
} from "../types";
import type { ComplianceGap } from "@/modules/compliance-gaps/types";

const AUDIT_REPORT_ENDPOINTS = {
  CREATE: "/v1/audit-reports",
  UPDATE: (reportId: string) => `/v1/audit-reports/${reportId}`,
  LIST: "/v1/audit-reports",
  BY_COMPLIANCE_DOMAINS: "/v1/audit-reports/compliance-domain",
  BY_ID: (reportId: string) => `/v1/audit-reports/${reportId}`,
  BY_SESSION: (sessionId: string) => `/v1/audit-reports/session/${sessionId}`,
  DOWNLOAD: (reportId: string) => `/v1/audit-reports/${reportId}/download`,
  EXECUTIVE_SUMMARY: "/v1/audit-reports/executive-summary",
  THREAT_INTELLIGENCE: "/v1/audit-reports/threat-intelligence",
  RISK_PRIORITIZATION: "/v1/audit-reports/risk-prioritization",
  TARGET_AUDIENCE: "/v1/audit-reports/target-audience",
  RECOMMENDATIONS: (sessionId: string) =>
    `/v1/audit-reports/recommendation/${sessionId}`,
  ACTION_ITEMS: (sessionId: string) =>
    `/v1/audit-reports/action-items/${sessionId}`,
  GENERATE: "/v1/audit-reports/generate",

  // Data source endpoints
  SESSION_CHATS: (sessionId: string) =>
    `/v1/history/audit-sessions/${sessionId}`,
  SESSION_GAPS: (sessionId: string) => `/v1/audit-sessions/${sessionId}/gaps`,
  SESSION_DOCUMENTS: (sessionId: string) =>
    `/v1/ingestions/audit-sessions/${sessionId}`,
} as const;

class AuditReportService {
  async createReport(
    reportData: AuditReportCreate
  ): Promise<AuditReportResponse> {
    try {
      const cleanedData = {
        ...reportData,
        chat_history_ids: reportData.chat_history_ids.map((id) => {
          const numId = typeof id === "string" ? parseInt(id, 10) : id;
          return isNaN(numId) ? 0 : numId;
        }),
        template_used: reportData.template_used?.trim() || null,
        report_status: "draft",
        total_questions_asked: 0,
        questions_answered_satisfactorily: 0,
        total_gaps_identified: reportData.compliance_gap_ids?.length || 0,
        critical_gaps_count: 0,
        high_risk_gaps_count: 0,
        medium_risk_gaps_count: 0,
        low_risk_gaps_count: 0,
        user_id: String(reportData.user_id),
        audit_session_id: String(reportData.audit_session_id),
        compliance_gap_ids:
          reportData.compliance_gap_ids?.map((id) => String(id)) || [],
        document_ids: reportData.document_ids?.map((id) => String(id)) || [],
        pdf_ingestion_ids:
          reportData.pdf_ingestion_ids?.map((id) => String(id)) || [],
      };

      const response = await http.post<AuditReport>(
        AUDIT_REPORT_ENDPOINTS.CREATE,
        cleanedData
      );
      const auditReport = response.data;

      return {
        success: true,
        message: "Audit report created successfully",
        report_id: auditReport.id,
        download_url: auditReport.download_url || undefined,
      };
    } catch (error: any) {
      const err = normalizeError(error);
      return {
        success: false,
        message: err.message || "Failed to create audit report",
        error: err.message || "Failed to create audit report",
      };
    }
  }

  async generateAuditReport(
    generateRequest: AuditReportGenerateRequest
  ): Promise<AuditReportGenerateResponse> {
    try {
      const response = await http.post<any>(
        AUDIT_REPORT_ENDPOINTS.GENERATE,
        generateRequest
      );
      const data = response.data;

      return {
        success: true,
        message: data.message || "Audit report generation started successfully",
        report_id: data.report_id,
        download_url: data.download_url,
        generation_status: data.generation_status || "completed",
      };
    } catch (error: any) {
      const err = normalizeError(error);
      return {
        success: false,
        message: err.message || "Failed to generate audit report",
        error: err.message || "Failed to generate audit report",
        generation_status: "failed",
      };
    }
  }
  async getAllReports(
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditReport[]> {
    try {
      const response = await http.get<AuditReport[]>(
        AUDIT_REPORT_ENDPOINTS.LIST,
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getAllReportsByComplianceDomain(): Promise<AuditReport[]> {
    try {
      const response = await http.get<AuditReport[]>(
        AUDIT_REPORT_ENDPOINTS.BY_COMPLIANCE_DOMAINS
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getReportById(reportId: string): Promise<AuditReport> {
    try {
      const response = await http.get<AuditReport>(
        AUDIT_REPORT_ENDPOINTS.BY_ID(reportId)
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionReports(
    sessionId: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<AuditReport[]> {
    try {
      const response = await http.get<AuditReport[]>(
        AUDIT_REPORT_ENDPOINTS.BY_SESSION(sessionId),
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async updateReport(
    reportId: string,
    updateData: Partial<AuditReport>,
    changeDescription?: string
  ): Promise<AuditReport> {
    try {
      const payload = {
        update_data: updateData,
        change_description:
          changeDescription || "Report updated via web interface",
      };

      const response = await http.patch<AuditReport>(
        AUDIT_REPORT_ENDPOINTS.UPDATE(reportId),
        payload
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await http.get(
        AUDIT_REPORT_ENDPOINTS.DOWNLOAD(reportId),
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionChatHistory(sessionId: string): Promise<ChatHistoryItem[]> {
    try {
      const response = await http.get<any>(
        AUDIT_REPORT_ENDPOINTS.SESSION_CHATS(sessionId)
      );
      const chatData = response.data?.data || response.data;
      if (!Array.isArray(chatData)) {
        return [];
      }
      return chatData.map((chat) => ({
        ...chat,
        id: typeof chat.id === "string" ? parseInt(chat.id, 10) : chat.id,
        selected: true,
      }));
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionComplianceGaps(
    sessionId: string
  ): Promise<ComplianceGapItem[]> {
    try {
      const response = await http.get<any>(
        AUDIT_REPORT_ENDPOINTS.SESSION_GAPS(sessionId)
      );
      // Handle wrapped response format
      const gapsData = response.data?.data || response.data;
      if (!Array.isArray(gapsData)) {
        return [];
      }
      return gapsData.map((gap) => ({
        ...gap,
        selected: true,
      }));
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getSessionDocuments(sessionId: string): Promise<DocumentItem[]> {
    try {
      const response = await http.get<any>(
        AUDIT_REPORT_ENDPOINTS.SESSION_DOCUMENTS(sessionId)
      );
      const documentsData = response.data?.data || response.data;
      if (!Array.isArray(documentsData)) {
        return [];
      }
      return documentsData.map((doc) => ({
        ...doc,
        selected: true,
      }));
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createExecutiveSummary(
    auditReport: AuditReportCreate,
    complianceGaps: ComplianceGap[],
    summaryType: SummaryTypeValue = SummaryType.STANDARD
  ): Promise<ExecutiveSummaryResponse> {
    try {
      const requestData: ExecutiveSummaryRequest = {
        audit_report: auditReport,
        compliance_gaps: complianceGaps,
        summary_type: summaryType,
      };

      const response = await http.post<ExecutiveSummaryResponse>(
        AUDIT_REPORT_ENDPOINTS.EXECUTIVE_SUMMARY,
        requestData
      );

      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createThreatIntelligence(
    auditReport: AuditReportCreate,
    complianceGaps: ComplianceGap[],
    summaryType: SummaryTypeValue = SummaryType.STANDARD
  ): Promise<ThreatIntelligenceResponse> {
    try {
      const requestData: ThreatIntelligenceRequest = {
        audit_report: auditReport,
        compliance_gaps: complianceGaps,
        summary_type: summaryType,
      };

      const response = await http.post<ThreatIntelligenceResponse>(
        AUDIT_REPORT_ENDPOINTS.THREAT_INTELLIGENCE,
        requestData
      );

      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createRiskPrioritization(
    auditReport: AuditReportCreate,
    complianceGaps: ComplianceGap[],
    summaryType: SummaryTypeValue = SummaryType.STANDARD
  ): Promise<RiskPrioritizationResponse> {
    try {
      const requestData: RiskPrioritizationRequest = {
        audit_report: auditReport,
        compliance_gaps: complianceGaps,
        summary_type: summaryType,
      };

      const response = await http.post<RiskPrioritizationResponse>(
        AUDIT_REPORT_ENDPOINTS.RISK_PRIORITIZATION,
        requestData
      );

      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createTargetAudience(
    auditReport: AuditReportCreate,
    complianceGaps: ComplianceGap[],
    summaryType: SummaryTypeValue = SummaryType.STANDARD
  ): Promise<TargetAudienceResponse> {
    try {
      const requestData: TargetAudienceRequest = {
        audit_report: auditReport,
        compliance_gaps: complianceGaps,
        summary_type: summaryType,
      };

      const response = await http.post<TargetAudienceResponse>(
        AUDIT_REPORT_ENDPOINTS.TARGET_AUDIENCE,
        requestData
      );

      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createRecommendation(
    sessionId: string
  ): Promise<AuditReportRecommendation> {
    try {
      const response = await http.post<AuditReportRecommendation>(
        AUDIT_REPORT_ENDPOINTS.RECOMMENDATIONS(sessionId)
      );

      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async createActionItem(sessionId: string): Promise<AuditReportActionItem> {
    try {
      const response = await http.post<AuditReportActionItem>(
        AUDIT_REPORT_ENDPOINTS.ACTION_ITEMS(sessionId)
      );

      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  // Helper method to get all data sources for a session
  async getSessionDataSources(sessionId: string): Promise<{
    chatHistory: ChatHistoryItem[];
    complianceGaps: ComplianceGapItem[];
    documents: DocumentItem[];
  }> {
    try {
      // Use Promise.allSettled to handle individual failures gracefully
      const [chatResult, gapsResult, documentsResult] =
        await Promise.allSettled([
          this.getSessionChatHistory(sessionId),
          this.getSessionComplianceGaps(sessionId),
          this.getSessionDocuments(sessionId),
        ]);

      const chatHistory =
        chatResult.status === "fulfilled" ? chatResult.value : [];
      const complianceGaps =
        gapsResult.status === "fulfilled" ? gapsResult.value : [];
      const documents =
        documentsResult.status === "fulfilled" ? documentsResult.value : [];

      if (chatResult.status === "rejected") {
        console.error("Failed to fetch chat history:", chatResult.reason);
      }
      if (gapsResult.status === "rejected") {
        console.error("Failed to fetch compliance gaps:", gapsResult.reason);
      }
      if (documentsResult.status === "rejected") {
        console.error("Failed to fetch documents:", documentsResult.reason);
      }
      return {
        chatHistory,
        complianceGaps,
        documents,
      };
    } catch (error) {
      console.error("Error in getSessionDataSources:", error);
      throw normalizeError(error);
    }
  }
}

export const auditReportService = new AuditReportService();
