import React, { useState } from 'react';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
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

const COMPLIANCE_OPTIONS = [
  { id: 'compliance_gaps', label: 'Compliance gaps' },
  { id: 'process_inconsistencies', label: 'Process inconsistencies' },
  { id: 'unclear_responsibilities', label: 'Unclear responsibilities' },
  { id: 'missing_controls', label: 'Missing controls' },
  { id: 'unrealistic_timelines', label: 'Unrealistic timelines' },
  { id: 'documentation_errors', label: 'Documentation errors' }
];

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  isStreaming, 
  disabled = false,
  placeholder = "Ask a question about compliance...",
  isCentered = false
}) => {
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [sectionValue, setSectionValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const handleSubmit = () => {
    if (!isLoading && !isStreaming && !disabled) {
      let finalMessage = '';
      
      // Build structured message if section or options are provided
      if (sectionValue || selectedOptions.length > 0) {
        const sectionText = sectionValue ? `section ${sectionValue}` : 'the document';
        const selectedLabels = selectedOptions.map(id => 
          COMPLIANCE_OPTIONS.find(opt => opt.id === id)?.label
        ).filter(Boolean);
        
        if (selectedLabels.length > 0) {
          finalMessage = `Analyze ${sectionText} in the SOP for the following potential issues: ${selectedLabels.join(', ')} against the reference ISO document`;
        }
        
        // Add additional user input if provided
        if (message.trim()) {
          if (finalMessage) {
            finalMessage += `. Additionally, please check for the following elements: ${message.trim()}`;
          } else {
            finalMessage = message.trim();
          }
        }
      } else if (message.trim()) {
        finalMessage = message.trim();
      }
      
      if (finalMessage) {
        onSendMessage(finalMessage);
        // Reset form
        setMessage('');
        setSectionValue('');
        setSelectedOptions([]);
        setShowOptions(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const hasContent = message.trim() || sectionValue || selectedOptions.length > 0;
  const isDisabled = !hasContent || isLoading || isStreaming || disabled;
  
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
              
              {/* Chevron button to reveal options */}
              <div className="mt-3 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showOptions ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Advanced options with animation */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showOptions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="mt-4 space-y-4 border-t pt-4">
                  {/* Section input */}
                  <div className={`transform transition-all duration-300 ease-in-out ${
                    showOptions ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  }`} style={{ transitionDelay: showOptions ? '100ms' : '0ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <Input
                      value={sectionValue}
                      onChange={(e) => setSectionValue(e.target.value)}
                      placeholder="e.g., 4.1.2 or Introduction"
                      className="w-full"
                    />
                  </div>
                  
                  {/* Compliance options */}
                  <div className={`transform transition-all duration-300 ease-in-out ${
                    showOptions ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  }`} style={{ transitionDelay: showOptions ? '200ms' : '0ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check for following missing elements:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPLIANCE_OPTIONS.map((option, index) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleOption(option.id)}
                          className={`text-left text-sm p-2 rounded border transition-all duration-200 ease-in-out transform ${
                            selectedOptions.includes(option.id)
                              ? 'border-green-400 bg-green-50 text-green-800'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
                          style={{ 
                            transitionDelay: showOptions ? `${300 + index * 50}ms` : '0ms' 
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-t bg-white shadow-lg">
      <div className="p-4">
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
        
        {/* Chevron button for bottom position */}
        <div className="mt-2 flex justify-center max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showOptions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Advanced options for bottom position with animation */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showOptions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="mt-3 max-w-4xl mx-auto space-y-3 border-t pt-3">
            {/* Section input */}
            <div className={`transform transition-all duration-300 ease-in-out ${
              showOptions ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`} style={{ transitionDelay: showOptions ? '100ms' : '0ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <Input
                value={sectionValue}
                onChange={(e) => setSectionValue(e.target.value)}
                placeholder="e.g., 4.1.2 or Introduction"
                className="w-full"
              />
            </div>
            
            {/* Compliance options */}
            <div className={`transform transition-all duration-300 ease-in-out ${
              showOptions ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`} style={{ transitionDelay: showOptions ? '200ms' : '0ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check for following missing elements:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMPLIANCE_OPTIONS.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    className={`text-left text-sm p-2 rounded border transition-all duration-200 ease-in-out transform ${
                      selectedOptions.includes(option.id)
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
                    style={{ 
                      transitionDelay: showOptions ? `${100 + index * 50}ms` : '0ms' 
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {isStreaming && (
          <div className="mt-2 text-sm text-gray-500 max-w-4xl mx-auto">
            AI is responding...
          </div>
        )}
      </div>
    </div>
  );
};