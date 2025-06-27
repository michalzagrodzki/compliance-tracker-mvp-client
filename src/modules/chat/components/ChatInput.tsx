import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  isCentered?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  isStreaming, 
  disabled = false,
  placeholder = "Ask a question about compliance...",
  isCentered = false
}) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = () => {
    if (message.trim() && !isLoading && !isStreaming && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isDisabled = !message.trim() || isLoading || isStreaming || disabled;
  
  if (isCentered) {
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-700 ease-in-out">
        <div className="w-full max-w-2xl mx-4 pointer-events-auto transform scale-110 transition-all duration-700 ease-in-out">
          <Card className="shadow-xl border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex space-x-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="flex-1 text-lg py-3"
                  disabled={disabled || isStreaming}
                  autoFocus
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isDisabled}
                  className="px-6 py-3"
                  size="lg"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-3 text-center text-sm text-gray-500">
                Press Enter to send your message
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-t bg-white p-4 shadow-lg">
      <div className="flex space-x-2 max-w-4xl mx-auto">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled || isStreaming}
        />
        <Button onClick={handleSubmit} disabled={isDisabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {isStreaming && (
        <div className="mt-2 text-sm text-gray-500 max-w-4xl mx-auto">
          AI is responding...
        </div>
      )}
    </div>
  );
};