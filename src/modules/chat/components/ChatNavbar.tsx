import React, { useState } from 'react';
import { ArrowLeft, FileText, Shield, ClipboardCheck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DocumentGroup } from '../types';

interface DocumentDropdownProps {
  title: string;
  icon: React.ReactNode;
  documents: DocumentGroup[];
  count: number;
  onDocumentClick?: (document: DocumentGroup) => void;
}

const DocumentDropdown: React.FC<DocumentDropdownProps> = ({ 
  title, 
  icon, 
  documents, 
  count, 
  onDocumentClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDocumentClick = (document: DocumentGroup) => {
    onDocumentClick?.(document);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span className="hidden sm:inline">{title}</span>
        <span className="border border-gray-400 text-gray-400 rounded-full px-2 py-1 text-xs">
          {count}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <h4 className="font-medium text-sm text-gray-900 mb-2">{title}</h4>
            <div className="space-y-1">
              {documents.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 italic">
                  No documents found
                </div>
              ) : (
                documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="p-2 hover:bg-gray-50 rounded text-sm cursor-pointer"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-gray-500 text-xs">{doc.filename}</div>
                    {doc.document_version && (
                      <div className="text-blue-600 text-xs">v{doc.document_version}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChatNavbarProps {
  sessionName: string;
  onBack: () => void;
  referenceDocuments: DocumentGroup[];
  implementationDocuments: DocumentGroup[];
  assessmentDocuments: DocumentGroup[];
  onDocumentClick?: (document: DocumentGroup) => void;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({
  onBack,
  referenceDocuments,
  implementationDocuments,
  assessmentDocuments,
  onDocumentClick
}) => {
  return (
    <div className="bg-white border-b px-4 py-1 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Session
        </Button>
        <h1 className="text-lg font-semibold">Chat Session</h1>
      </div>
      
      <div className="flex items-center space-x-2">
      {referenceDocuments.length > 0 && (
        <DocumentDropdown
          title="Reference Docs"
          icon={<FileText className="h-4 w-4" />}
          documents={referenceDocuments}
          count={referenceDocuments.length}
          onDocumentClick={onDocumentClick}
          />
        )}
        {implementationDocuments.length > 0 && (
          <DocumentDropdown
            title="Implementation"
            icon={<Shield className="h-4 w-4" />}
            documents={implementationDocuments}
            count={implementationDocuments.length}
            onDocumentClick={onDocumentClick}
          />
        )}
        {assessmentDocuments.length > 0 && (
          <DocumentDropdown
            title="Assessment"
            icon={<ClipboardCheck className="h-4 w-4" />}
            documents={assessmentDocuments}
            count={assessmentDocuments.length}
            onDocumentClick={onDocumentClick}
            />
        )}
      </div>
    </div>
  );
};