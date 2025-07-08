/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useComplianceGap, ComplianceGapModal } from '@/modules/compliance-gaps';
import { ChatNavbar } from './ChatNavbar';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loading from '@/components/Loading';

export const ChatSession: React.FC = () => {
  const { sessionId, chatId } = useParams<{ sessionId: string; chatId: string }>();
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const {
    currentSession,
    messages,
    isLoading,
    isStreaming,
    error,
    documents,
    initializeChat,
    sendMessage,
    clearError
  } = useChatStore();

  const {
    isModalOpen,
    modalData,
    cancelModal,
  } = useComplianceGap();

  useEffect(() => {
    if (sessionId && chatId) {
      initializeChat(sessionId, chatId);
    }
  }, [sessionId, chatId, initializeChat]);

  // Check if user has already interacted (has messages)
  useEffect(() => {
    if (messages.length > 0) {
      setHasInteracted(true);
    }
  }, [messages.length]);

  const handleBack = () => {
    if (sessionId) {
      navigate(`/audit-sessions/${sessionId}`);
    } else {
      navigate('/audit-sessions');
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      // Mark as interacted to trigger the transition
      setHasInteracted(true);
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDocumentClick = (document: any) => {
    console.log('Document clicked:', document);
    // TODO: Implement document viewing/referencing functionality
  };


  if (isLoading && !currentSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error && !currentSession) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Chat</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => clearError()} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleBack} className="w-full">
                Back to Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentSession && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
            <p className="text-gray-600 mb-4">
              The chat session you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Button onClick={handleBack} className="w-full">
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
        <ChatNavbar
          sessionName={currentSession?.session_name || 'Chat Session'}
          onBack={handleBack}
          referenceDocuments={documents.reference}
          implementationDocuments={documents.implementation}
          assessmentDocuments={documents.assessment}
          onDocumentClick={handleDocumentClick}
        />

        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 relative z-30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div className={`transition-all duration-700 ease-in-out flex-1 min-h-0 overflow-hidden ${
          hasInteracted ? 'mb-0' : ''
        }`}>
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            hasInteracted={hasInteracted}
          />
        </div>

        <div className={`transition-all duration-700 ease-in-out flex-shrink-0 ${
          hasInteracted 
            ? 'relative z-20' 
            : 'absolute inset-0 z-10 pointer-events-none'
        }`}>
          <div className={`${
            hasInteracted 
              ? 'fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-6xl mx-auto px-4 pb-4' 
              : 'flex items-center justify-center h-full pointer-events-auto'
          }`}>
            <div className={hasInteracted ? 'w-full' : 'w-full max-w-4xl px-4'}>
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isStreaming={isStreaming}
                disabled={!currentSession}
                placeholder={
                  currentSession 
                    ? `Ask about ${currentSession.compliance_domain} compliance...`
                    : "Loading chat session..."
                }
                isCentered={!hasInteracted}
              />
            </div>
          </div>
        </div>
      </div>

      <ComplianceGapModal
        isOpen={isModalOpen}
        onClose={cancelModal}
        chatHistoryId={modalData?.chatHistoryId || ''}
        auditSessionId={modalData?.auditSessionId}
        complianceDomain={modalData?.complianceDomain}
        initialMessage={modalData?.initialMessage}
        sources={modalData?.sources}
      />
    </>
  );
};

export default ChatSession;