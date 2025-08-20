/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import { authService } from "@/modules/auth/services/authService";
import type {
  ChatMessage,
  QueryRequest,
  QueryResponse,
  DocumentsByType,
  DocumentGroup,
  SourceDocument,
  ChatHistoryResponse,
} from "../types";

const CHAT_ENDPOINTS = {
  QUERY: "/v1/query",
  QUERY_STREAM: "/v1/query-stream",
  HISTORY: (conversationId: string) => `/v1/history/${conversationId}`,
  HISTORY_ITEM: (messageId: string) => `/v1/history/item/${messageId}`,
  AUDIT_SESSION_HISTORY: (auditSessionId: string) =>
    `/v1/audit-sessions/${auditSessionId}/history`,
  DOCUMENTS: "/v1/documents",
  AUDIT_SESSION: (sessionId: string) => `/v1/audit-sessions/${sessionId}`,
  SESSION_DOCUMENTS: (sessionId: string) =>
    `/v1/ingestions/audit-sessions/${sessionId}`,
} as const;

class ChatService {
  // Send a query message and get a response
  async sendQuery(queryRequest: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await http.post<QueryResponse>(
        CHAT_ENDPOINTS.QUERY,
        queryRequest
      );
      return response.data;
    } catch (error: any) {
      // The http interceptor will handle auth errors automatically
      throw new Error(error.response?.data?.detail || "Failed to send query");
    }
  }

  // Send a streaming query
  async sendStreamingQuery(
    queryRequest: QueryRequest,
    onToken: (token: string) => void,
    onComplete: (response: QueryResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // Get the auth token using the same method as the http interceptor
      const authToken = this.getAuthToken();

      const response = await fetch(
        `${http.defaults.baseURL}${CHAT_ENDPOINTS.QUERY_STREAM}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
          body: JSON.stringify(queryRequest),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await this.handleAuthRefresh();
          const newToken = this.getAuthToken();
          const retry = await fetch(
            `${http.defaults.baseURL}${CHAT_ENDPOINTS.QUERY_STREAM}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(newToken && { Authorization: `Bearer ${newToken}` }),
              },
              body: JSON.stringify(queryRequest),
            }
          );
          if (!retry.ok) {
            throw new Error(
              `HTTP ${retry.status}: ${await retry.text().catch(() => "")}`
            );
          }
          const reader = retry.body!.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) onToken(decoder.decode(value, { stream: true }));
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            fullAnswer += line;
            onToken(line);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        fullAnswer += buffer;
        onToken(buffer);
      }

      // Get conversation ID and other metadata from response headers
      const conversationId = response.headers.get("x-conversation-id") || "";
      const auditSessionId = response.headers.get("x-audit-session-id") || "";
      const complianceDomain =
        response.headers.get("x-compliance-domain") || "";

      onComplete({
        answer: fullAnswer,
        source_docs: [], // Will be populated from metadata
        conversation_id: conversationId,
        audit_session_id: auditSessionId,
        compliance_domain: complianceDomain,
      });
    } catch (error) {
      onError(error as Error);
    }
  }

  // Helper function to safely parse timestamps
  private parseTimestamp(timestamp: any): Date {
    if (!timestamp) {
      return new Date();
    }

    // If it's already a Date object, return it
    if (timestamp instanceof Date) {
      return timestamp;
    }

    // If it's a string, try to parse it
    if (typeof timestamp === "string") {
      const parsed = new Date(timestamp);
      // Check if the parsed date is valid
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // If it's a number (timestamp), convert it
    if (typeof timestamp === "number") {
      return new Date(timestamp);
    }

    // Fallback to current date if all else fails
    console.warn("Invalid timestamp provided:", timestamp);
    return new Date();
  }

  // Convert API response to ChatMessage format
  private formatApiResponseToMessage(item: any): ChatMessage {
    return {
      id: item.id?.toString() || Date.now().toString(),
      type: "user", // First message is user question
      message: item.question || "",
      timestamp: this.parseTimestamp(item.created_at),
      conversation_id: item.conversation_id,
      audit_session_id: item.audit_session_id,
      compliance_domain: item.compliance_domain,
      sources: [],
      response_time_ms: item.response_time_ms,
      metadata: item.metadata,
    };
  }

  private formatSimilarity(similarity: number | undefined): string {
    if (!similarity) return "0,00";
    return similarity.toFixed(2).replace(".", ",");
  }

  // Convert API response to AI ChatMessage format
  private formatApiResponseToAiMessage(item: any): ChatMessage {
    // Extract source filenames from metadata
    const sources: SourceDocument[] = [];

    if (item.metadata?.document_details) {
      item.metadata.document_details.forEach((doc: any) => {
        sources.push({
          title: doc.title || "Unknown Title",
          author: doc.author || "Unknown Author",
          similarity: this.formatSimilarity(doc.similarity),
          document_version: doc.document_version || "Unknown Version",
          source_page_number: doc.source_page_number || 0,
          source_filename: doc.source_filename,
        });
      });
    }
    return {
      id: (parseInt(item.id) + 0.5).toString(), // Ensure AI message has different ID
      type: "ai",
      message: item.answer || "",
      timestamp: this.parseTimestamp(item.created_at),
      conversation_id: item.conversation_id,
      audit_session_id: item.audit_session_id,
      compliance_domain: item.compliance_domain,
      sources: sources,
      response_time_ms: item.response_time_ms,
      metadata: item.metadata,
    };
  }

  // Get chat history for a conversation
  async getChatHistory(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await http.get<any[]>(
        CHAT_ENDPOINTS.HISTORY(conversationId)
      );

      const messages: ChatMessage[] = [];

      // Convert each API response item to user question + AI answer pair
      response.data.forEach((item) => {
        // Add user message (question)
        messages.push(this.formatApiResponseToMessage(item));

        // Add AI message (answer)
        messages.push(this.formatApiResponseToAiMessage(item));
      });

      // Sort messages by timestamp to ensure correct order
      return messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get chat history"
      );
    }
  }

  async getChatHistoryItem(
    messageId: string,
    messageType: "user" | "ai" = "ai"
  ): Promise<ChatMessage> {
    try {
      const response = await http.get<ChatHistoryResponse>(
        CHAT_ENDPOINTS.HISTORY_ITEM(messageId)
      );

      const historyItem = response.data;

      if (messageType === "user") {
        return this.formatApiResponseToMessage(historyItem);
      } else {
        return this.formatApiResponseToAiMessage(historyItem);
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get chat history item"
      );
    }
  }

  // Get chat history for an audit session
  async getAuditSessionHistory(auditSessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await http.get<any[]>(
        CHAT_ENDPOINTS.AUDIT_SESSION_HISTORY(auditSessionId)
      );

      const messages: ChatMessage[] = [];

      // Convert each API response item to user question + AI answer pair
      response.data.forEach((item) => {
        // Add user message (question)
        messages.push(this.formatApiResponseToMessage(item));

        // Add AI message (answer)
        messages.push(this.formatApiResponseToAiMessage(item));
      });

      // Sort messages by timestamp to ensure correct order
      return messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get audit session history"
      );
    }
  }

  // Get audit session details
  async getAuditSession(sessionId: string): Promise<any> {
    try {
      const response = await http.get(CHAT_ENDPOINTS.AUDIT_SESSION(sessionId));
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get audit session"
      );
    }
  }

  // Get documents for an audit session
  async getSessionDocuments(sessionId: string): Promise<DocumentGroup[]> {
    try {
      const response = await http.get<DocumentGroup[]>(
        CHAT_ENDPOINTS.SESSION_DOCUMENTS(sessionId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get session documents"
      );
    }
  }

  // Get all documents with optional filtering
  async getDocuments(params?: {
    compliance_domain?: string;
    document_tags?: string[];
    skip?: number;
    limit?: number;
  }): Promise<DocumentGroup[]> {
    try {
      const response = await http.get<DocumentGroup[]>(
        CHAT_ENDPOINTS.DOCUMENTS,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get documents"
      );
    }
  }

  // Categorize documents by type based on tags
  categorizeDocuments(documents: DocumentGroup[]): DocumentsByType {
    const reference: DocumentGroup[] = [];
    const implementation: DocumentGroup[] = [];
    const assessment: DocumentGroup[] = [];

    documents.forEach((doc) => {
      const tags = doc.document_tags || [];

      if (
        tags.includes("reference_document") ||
        tags.includes("iso_standard") ||
        tags.includes("regulatory_framework")
      ) {
        reference.push(doc);
      } else if (
        tags.includes("implementation_document") ||
        tags.includes("sop") ||
        tags.includes("procedure") ||
        tags.includes("internal_policy")
      ) {
        implementation.push(doc);
      } else if (
        tags.includes("assessment_document") ||
        tags.includes("audit_report") ||
        tags.includes("gap_analysis")
      ) {
        assessment.push(doc);
      } else {
        // Default to reference if no specific tags
        reference.push(doc);
      }
    });

    return { reference, implementation, assessment };
  }

  private getAuthToken(): string {
    try {
      return authService.getAccessToken() || "";
    } catch (error) {
      console.warn("Failed to get auth token:", error);
      return "";
    }
  }

  private async handleAuthRefresh(): Promise<void> {
    try {
      const refreshToken = authService.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const tokenResponse = await authService.refreshToken({
        refresh_token: refreshToken,
      });

      authService.setAuthTokens(tokenResponse);
    } catch (error) {
      authService.clearTokens();
      window.location.href = "/login";
      throw error;
    }
  }

  // Format message for display
  formatMessage(message: any): ChatMessage {
    return {
      id: message.id || Date.now().toString(),
      type: message.type || "ai",
      message: message.message || message.answer || "",
      timestamp: this.parseTimestamp(message.timestamp || message.created_at),
      sources:
        message.sources ||
        message.source_docs
          ?.map((doc: any) => doc.metadata?.source_filename)
          .filter(Boolean) ||
        [],
      conversation_id: message.conversation_id,
      audit_session_id: message.audit_session_id,
      compliance_domain: message.compliance_domain,
      response_time_ms: message.response_time_ms,
      metadata: message.metadata,
    };
  }

  // Log document access
  async logDocumentAccess(
    documentId: string,
    accessType: "reference" | "view" | "search",
    chatMessageId?: string
  ): Promise<void> {
    try {
      // This would be implemented based on your document access logging API
      console.log("Logging document access:", {
        documentId,
        accessType,
        chatMessageId,
      });
    } catch (error) {
      console.warn("Failed to log document access:", error);
    }
  }
}

export const chatService = new ChatService();
