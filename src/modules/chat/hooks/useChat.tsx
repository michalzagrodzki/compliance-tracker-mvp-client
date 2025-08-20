import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { chatService } from '../services/chatService';
import { chatStreamService } from '../services/core/chatStreamService';
import { normalizeError } from '@/lib/error';
import type { ChatMessage, ChatSession, QueryRequest } from '../types';

export const useChat = (sessionId?: string, chatId?: string) => {
  const {
    currentSession,
    messages,
    isLoading,
    isStreaming,
    error,
    documents,
    setCurrentSession,
    setMessages,
    addMessage,
    updateMessage,
    removeMessage,
    setLoading,
    setStreaming,
    setError,
    clearError,
    setDocuments,
    clearChat,
    findMessageById,
    getMessagesByType,
    getConversationStats,
    getReferencedSources,
  } = useChatStore();

  // Initialize chat when sessionId and chatId are provided
  const initializeChat = useCallback(async (sessionId: string, chatId: string) => {
    setLoading(true);
    clearError();

    try {
      // Load audit session details
      const auditSession = await chatService.getAuditSession(sessionId);

      // Try to load existing chat history first using the chatId as conversation_id
      let chatSession: ChatSession;
      let existingHistory: ChatMessage[] = [];

      try {
        // Attempt to load existing chat history using the chatId
        existingHistory = await chatService.getChatHistory(chatId);

        // If we have existing history, use the chatId as the conversation_id
        chatSession = {
          id: chatId,
          conversation_id: chatId, // Use the existing chatId
          audit_session_id: sessionId,
          compliance_domain: auditSession.compliance_domain,
          session_name: auditSession.session_name,
          created_at: new Date(), // This would ideally come from the first message timestamp
          updated_at: new Date(),
          messages: existingHistory,
        };

        console.log(
          `Loaded existing chat session with ${existingHistory.length} messages`
        );
      } catch {
        console.log("No existing chat history found, creating new session");

        // No existing history found, create a new chat session
        chatSession = {
          id: chatId,
          conversation_id: chatId, // Use the provided chatId instead of generating new one
          audit_session_id: sessionId,
          compliance_domain: auditSession.compliance_domain,
          session_name: auditSession.session_name,
          created_at: new Date(),
          updated_at: new Date(),
          messages: [],
        };
      }

      // Load documents (only those attached to the current audit session)
      try {
        const sessionDocuments = await chatService.getSessionDocuments(sessionId);
        const categorizedDocs = chatService.categorizeDocuments(sessionDocuments);
        setDocuments(categorizedDocs);
      } catch (documentError) {
        console.warn("Failed to load documents:", documentError);
      }

      setCurrentSession(chatSession);
      setMessages(existingHistory);
    } catch (error) {
      const normalizedError = normalizeError(error);
      setError(normalizedError.message || "Failed to initialize chat session");
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setCurrentSession, setMessages, setError, setDocuments]);

  // Auto-initialize when sessionId and chatId are provided
  useEffect(() => {
    if (sessionId && chatId) {
      initializeChat(sessionId, chatId);
    }

    // Cleanup when component unmounts
    return () => {
      if (!sessionId || !chatId) {
        clearChat();
      }
    };
  }, [sessionId, chatId, initializeChat, clearChat]);

  // Send message with streaming
  const sendMessage = useCallback(async (message: string) => {
    if (!currentSession) {
      setError("No active chat session");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message,
      timestamp: new Date(),
      conversation_id: currentSession.conversation_id,
      audit_session_id: currentSession.audit_session_id,
      compliance_domain: currentSession.compliance_domain,
    };

    addMessage(userMessage);
    setStreaming(true);
    clearError();

    // Derive document filters from current session documents
    const allSessionDocs = [
      ...(documents?.reference || []),
      ...(documents?.implementation || []),
      ...(documents?.assessment || []),
    ];
    console.log("documents:")
    console.log(allSessionDocs)
    const derivedDocumentVersions = Array.from(
      new Set(
        allSessionDocs
          .map((d) => d.document_version)
          .filter((v): v is string => Boolean(v))
      )
    );
    const derivedDocumentTags = Array.from(
      new Set(
        allSessionDocs.flatMap((d) => (d.document_tags || []).filter(Boolean))
      )
    );

    const queryRequest: QueryRequest = {
      question: message,
      conversation_id: currentSession.conversation_id,
      audit_session_id: currentSession.audit_session_id,
      compliance_domain: currentSession.compliance_domain,
      match_threshold: 0.75,
      match_count: 5,
      document_versions: derivedDocumentVersions.length ? derivedDocumentVersions : undefined,
      document_tags: derivedDocumentTags.length ? derivedDocumentTags : undefined,
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      type: "ai",
      message: "",
      timestamp: new Date(),
      conversation_id: currentSession.conversation_id,
      audit_session_id: currentSession.audit_session_id,
      compliance_domain: currentSession.compliance_domain,
      sources: [],
    };

    addMessage(aiMessage);

    try {
      await chatStreamService.createStream(queryRequest, {
        onToken: (token: string) => {
          updateMessage(aiMessageId, { 
            message: (findMessageById(aiMessageId)?.message || '') + token 
          });
        },
        onComplete: (response) => {
          updateMessage(aiMessageId, {
            sources: response.source_docs
              ?.map((doc) => doc.metadata?.source_filename)
              .filter(Boolean) || [],
            response_time_ms: response.response_time_ms,
            metadata: response.metadata,
          });
          setStreaming(false);
        },
        onError: (error) => {
          removeMessage(aiMessageId);
          setError(`Failed to get response: ${error.message}`);
          setStreaming(false);
        },
      });
    } catch (error) {
      const normalizedError = normalizeError(error);
      removeMessage(aiMessageId);
      setError(normalizedError.message);
      setStreaming(false);
    }
  }, [
    currentSession,
    addMessage,
    setStreaming,
    clearError,
    setError,
    updateMessage,
    removeMessage,
    findMessageById,
    documents,
  ]);

  // Load chat history
  const loadChatHistory = useCallback(async (conversationId: string) => {
    setLoading(true);
    clearError();

    try {
      const history = await chatService.getChatHistory(conversationId);
      setMessages(history);
    } catch (error) {
      const normalizedError = normalizeError(error);
      setError(normalizedError.message || "Failed to load chat history");
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setMessages, setError]);

  // Load chat history item
  const loadChatHistoryItem = useCallback(async (chatHistoryId: string) => {
    setLoading(true);
    clearError();

    try {
      const chatMessage = await chatService.getChatHistoryItem(chatHistoryId);
      return chatMessage;
    } catch (error) {
      const normalizedError = normalizeError(error);
      setError(normalizedError.message || "Failed to load chat history item");
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  // Load documents (only those attached to the current audit session)
  const loadDocuments = useCallback(async (sessionId: string) => {
    try {
      const sessionDocuments = await chatService.getSessionDocuments(sessionId);
      const categorizedDocs = chatService.categorizeDocuments(sessionDocuments);
      setDocuments(categorizedDocs);
    } catch (error) {
      console.warn("Failed to load documents:", error);
    }
  }, [setDocuments]);

  return {
    // State
    currentSession,
    messages,
    isLoading,
    isStreaming,
    error,
    documents,
    
    // Actions
    initializeChat,
    sendMessage,
    loadChatHistory,
    loadChatHistoryItem,
    loadDocuments,
    clearError,
    clearChat,
    
    // Computed values
    conversationStats: getConversationStats(),
    referencedSources: getReferencedSources(),
    messagesByType: {
      user: getMessagesByType("user"),
      ai: getMessagesByType("ai"),
    },
    
    // Status checks
    isInitialized: !!currentSession,
    hasMessages: messages.length > 0,
    canSendMessage: !!currentSession && !isLoading && !isStreaming,
    
    // Utility methods
    findMessageById,
  };
};
