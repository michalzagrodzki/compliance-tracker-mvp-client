import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';

export const useChat = (sessionId?: string, chatId?: string) => {
  const {
    currentSession,
    messages,
    isLoading,
    isStreaming,
    error,
    documents,
    initializeChat,
    sendMessage,
    clearError,
    clearChat
  } = useChatStore();

  // Initialize chat when sessionId and chatId are provided
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

  // Memoized send message function
  const handleSendMessage = useCallback(async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage]);

  // Get conversation statistics
  const getConversationStats = useCallback(() => {
    const userMessages = messages.filter(m => m.type === 'user').length;
    const aiMessages = messages.filter(m => m.type === 'ai').length;
    const totalMessages = messages.length;
    const avgResponseTime = messages
      .filter(m => m.type === 'ai' && m.response_time_ms)
      .reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / aiMessages || 0;

    return {
      userMessages,
      aiMessages,
      totalMessages,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }, [messages]);

  // Get unique sources referenced in the conversation
  const getReferencedSources = useCallback(() => {
    const sources = new Set<string>();
    messages.forEach(message => {
      if (message.sources) {
        message.sources.forEach(source => sources.add(source));
      }
    });
    return Array.from(sources);
  }, [messages]);

  return {
    // State
    currentSession,
    messages,
    isLoading,
    isStreaming,
    error,
    documents,
    
    // Actions
    sendMessage: handleSendMessage,
    clearError,
    clearChat,
    
    // Computed values
    conversationStats: getConversationStats(),
    referencedSources: getReferencedSources(),
    
    // Status checks
    isInitialized: !!currentSession,
    hasMessages: messages.length > 0,
    canSendMessage: !!currentSession && !isLoading && !isStreaming
  };
};