import { authService } from '@/modules/auth/services/authService';
import { normalizeStreamError } from '@/lib/error';
import type { QueryRequest, QueryResponse } from '../../types';
import type { ApiError } from '@/lib/error';

interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (response: QueryResponse) => void;
  onError: (error: ApiError) => void;
}

class ChatStreamService {
  private baseURL: string;
  private abortController: AbortController | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  }

  /**
   * Create streaming request with automatic auth handling
   */
  async createStream(
    request: QueryRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
    this.abortController = new AbortController();
    
    try {
      const headers = await authService.getAuthHeaders();
      const response = await this.fetchWithRetry(
        `${this.baseURL}/v1/query-stream`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
          signal: this.abortController.signal
        }
      );

      await this.processStream(response, callbacks);
    } catch (error) {
      const normalizedError = normalizeStreamError(error, 'connection');
      callbacks.onError(normalizedError);
    }
  }

  /**
   * Fetch with auth retry logic (similar to axios interceptor)
   */
  private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    let response = await fetch(url, options);
    
    // Handle 401 with token refresh (like axios interceptor)
    if (response.status === 401) {
      try {
        const refreshedHeaders = await authService.getAuthHeaders();
        response = await fetch(url, {
          ...options,
          headers: { ...options.headers, ...refreshedHeaders }
        });
      } catch (refreshError) {
        throw normalizeStreamError(refreshError, 'connection');
      }
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }

  /**
   * Process streaming response
   */
  private async processStream(
    response: Response, 
    callbacks: StreamCallbacks
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw normalizeStreamError(new Error('No response body reader available'), 'reading');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullAnswer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            fullAnswer += line;
            callbacks.onToken(line);
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        fullAnswer += buffer;
        callbacks.onToken(buffer);
      }

      // Extract metadata from response headers
      const conversationId = response.headers.get('x-conversation-id') || '';
      const auditSessionId = response.headers.get('x-audit-session-id') || '';
      const complianceDomain = response.headers.get('x-compliance-domain') || '';

      callbacks.onComplete({
        answer: fullAnswer,
        source_docs: [],
        conversation_id: conversationId,
        audit_session_id: auditSessionId,
        compliance_domain: complianceDomain,
      });

    } catch (error) {
      throw normalizeStreamError(error, 'reading');
    } finally {
      reader.releaseLock();
      this.abortController = null;
    }
  }

  /**
   * Cancel ongoing stream
   */
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if stream is active
   */
  isStreaming(): boolean {
    return this.abortController !== null;
  }
}

export const chatStreamService = new ChatStreamService();