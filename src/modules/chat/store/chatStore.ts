/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { create } from "zustand";
import { chatService } from "../services/chatService";
import type {
  ChatState,
  ChatActions,
  ChatMessage,
  ChatSession,
  QueryRequest,
} from "../types";

interface ChatStore extends ChatState, ChatActions {}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  documents: {
    reference: [],
    implementation: [],
    assessment: [],
  },

  initializeChat: async (sessionId: string, chatId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Load audit session details
      const auditSession = await chatService.getAuditSession(sessionId);

      // Create or load chat session
      const chatSession: ChatSession = {
        id: chatId,
        conversation_id: chatService.generateConversationId(),
        audit_session_id: sessionId,
        compliance_domain: auditSession.compliance_domain,
        session_name: auditSession.session_name,
        created_at: new Date(),
        updated_at: new Date(),
        messages: [],
      };

      // Load documents
      await get().loadDocuments(sessionId);

      // Try to load existing chat history
      try {
        const existingHistory = await chatService.getChatHistory(
          chatSession.conversation_id
        );
        chatSession.messages = existingHistory;
        set({ messages: existingHistory });
      } catch (error) {
        console.log("No existing chat history found, starting fresh");
      }

      set({
        currentSession: chatSession,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to initialize chat session",
        isLoading: false,
      });
    }
  },

  sendMessage: async (message: string) => {
    const state = get();

    if (!state.currentSession) {
      set({ error: "No active chat session" });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message,
      timestamp: new Date(),
      conversation_id: state.currentSession.conversation_id,
      audit_session_id: state.currentSession.audit_session_id,
      compliance_domain: state.currentSession.compliance_domain,
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      error: null,
    }));

    const queryRequest: QueryRequest = {
      question: message,
      conversation_id: state.currentSession.conversation_id,
      audit_session_id: state.currentSession.audit_session_id,
      compliance_domain: state.currentSession.compliance_domain,
      match_threshold: 0.75,
      match_count: 5,
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      type: "ai",
      message: "",
      timestamp: new Date(),
      conversation_id: state.currentSession.conversation_id,
      audit_session_id: state.currentSession.audit_session_id,
      compliance_domain: state.currentSession.compliance_domain,
      sources: [],
    };

    set((state) => ({
      messages: [...state.messages, aiMessage],
    }));

    try {
      await chatService.sendStreamingQuery(
        queryRequest,
        // On token received
        (token: string) => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, message: msg.message + token }
                : msg
            ),
          }));
        },
        (response) => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    sources:
                      response.source_docs
                        ?.map((doc) => doc.metadata?.source_filename)
                        .filter(Boolean) || [],
                    response_time_ms: response.response_time_ms,
                    metadata: response.metadata,
                  }
                : msg
            ),
            isStreaming: false,
          }));
        },
        (error) => {
          set((state) => ({
            messages: state.messages.filter((msg) => msg.id !== aiMessageId),
            error: `Failed to get response: ${error.message}`,
            isStreaming: false,
          }));
        }
      );
    } catch (error: any) {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== aiMessageId),
        error: error.response?.data?.detail || "Failed to send message",
        isStreaming: false,
      }));
    }
  },

  loadChatHistory: async (conversationId: string) => {
    set({ isLoading: true, error: null });

    try {
      const history = await chatService.getChatHistory(conversationId);
      set({
        messages: history,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to load chat history",
        isLoading: false,
      });
    }
  },

  loadDocuments: async (sessionId: string) => {
    try {
      const sessionDocuments = await chatService.getSessionDocuments(sessionId);

      let allDocuments = sessionDocuments;
      if (allDocuments.length === 0) {
        allDocuments = await chatService.getDocuments({
          limit: 100,
        });
      }

      const categorizedDocs = chatService.categorizeDocuments(allDocuments);

      set({ documents: categorizedDocs });
    } catch (error: any) {
      console.warn("Failed to load documents:", error);
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setStreaming: (streaming: boolean) => set({ isStreaming: streaming }),

  clearError: () => set({ error: null }),

  clearChat: () =>
    set({
      currentSession: null,
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      documents: {
        reference: [],
        implementation: [],
        assessment: [],
      },
    }),
}));
