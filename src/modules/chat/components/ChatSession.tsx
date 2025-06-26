/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ChatNavbar } from './ChatNavbar';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loading from '@/components/Loading';

export const ChatSession: React.FC = () => {
  const { sessionId, chatId } = useParams<{ sessionId: string; chatId: string }>();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    if (sessionId && chatId) {
      initializeChat(sessionId, chatId);
    }
  }, [sessionId, chatId, initializeChat]);

  const handleBack = () => {
    if (sessionId) {
      navigate(`/audit-sessions/${sessionId}`);
    } else {
      navigate('/audit-sessions');
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDocumentClick = (document: any) => {
    console.log('Document clicked:', document);
    // TODO: Implement document viewing/referencing functionality
  };

  const handleIdentifyGap = (messageId: string) => {
    console.log('Identify compliance gap for message:', messageId);
    // TODO: Implement compliance gap identification functionality
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
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatNavbar
        sessionName={currentSession?.session_name || 'Chat Session'}
        onBack={handleBack}
        referenceDocuments={documents.reference}
        implementationDocuments={documents.implementation}
        assessmentDocuments={documents.assessment}
        onDocumentClick={handleDocumentClick}
      />

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
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

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onIdentifyGap={handleIdentifyGap}
      />

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
      />
    </div>
  );
};

export default ChatSession;