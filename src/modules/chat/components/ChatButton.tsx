
import React from 'react';
import { useNavigate } from 'react-router';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatUtils } from "./../utils/chatUtils";

interface ChatButtonProps {
  sessionId: string;
  sessionName?: string;
  complianceDomain?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  sessionId,
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    // Generate a new chat ID
    const chatId = chatUtils.generateChatId();
    
    // Navigate to the chat route
    navigate(`/audit-sessions/${sessionId}/chat/${chatId}`);
  };

  return (
    <Button
      onClick={handleStartChat}
      variant={variant}
      size={size}
      className={`flex items-center space-x-2 ${className}`}
    >
      <MessageSquare className="h-4 w-4" />
      <span>Start Compliance Chat</span>
    </Button>
  );
};

// Usage example for AuditSessionDetail component:
/*
import { ChatButton } from '@/modules/chat';

// In your AuditSessionDetail component, add this to the actions section:
<ChatButton 
  sessionId={currentSession.id}
  sessionName={currentSession.session_name}
  complianceDomain={currentSession.compliance_domain}
  className="flex items-center space-x-2"
/>
*/