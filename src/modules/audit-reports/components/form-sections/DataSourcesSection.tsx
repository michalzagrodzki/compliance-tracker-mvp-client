
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface ChatHistory {
  id: number;
  user_message?: string;
  message?: string;
  timestamp: string;
  selected?: boolean;
}

interface ComplianceGap {
  id: string;
  gap_title: string;
  risk_level: string;
  gap_type: string;
  selected?: boolean;
}

interface Document {
  id: string;
  filename: string;
  upload_date: string;
  file_size?: number;
  selected?: boolean;
}

interface DataSourcesSectionProps {
  selectedAuditSession: string;
  showDataSourcesDetails: {
    chats: boolean;
    gaps: boolean;
    documents: boolean;
  };
  onToggleDataSourcesDetail: (source: 'chats' | 'gaps' | 'documents') => void;
  
  // Chat History
  chatHistory: ChatHistory[];
  selectedChatIds: number[];
  onChatSelectionChange: (chatId: number, selected: boolean) => void;
  isLoadingChats: boolean;
  
  // Compliance Gaps
  complianceGaps: ComplianceGap[];
  selectedGapIds: string[];
  onGapSelectionChange: (gapId: string, selected: boolean) => void;
  isLoadingGaps: boolean;
  
  // Documents
  documents: Document[];
  selectedDocumentIds: string[];
  onDocumentSelectionChange: (docId: string, selected: boolean) => void;
  isLoadingDocuments: boolean;
  
  // Loading states
  isLoadingSessionData: boolean;
  
  // Bulk actions
  onSelectAllChats?: (selected: boolean) => void;
  onSelectAllGaps?: (selected: boolean) => void;
  onSelectAllDocuments?: (selected: boolean) => void;
}

export default function DataSourcesSection({
  selectedAuditSession,
  showDataSourcesDetails,
  onToggleDataSourcesDetail,
  chatHistory,
  selectedChatIds,
  onChatSelectionChange,
  isLoadingChats,
  complianceGaps,
  selectedGapIds,
  onGapSelectionChange,
  isLoadingGaps,
  documents,
  selectedDocumentIds,
  onDocumentSelectionChange,
  isLoadingDocuments,
  isLoadingSessionData,
  onSelectAllChats,
  onSelectAllGaps,
  onSelectAllDocuments
}: DataSourcesSectionProps) {
  if (!selectedAuditSession) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Select an audit session first</p>
        <p className="text-sm text-gray-500 mt-1">
          Choose a compliance domain and audit session to view available data sources
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chat History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Chat History</span>
            <span className="text-sm text-muted-foreground">
              ({selectedChatIds.length} of {chatHistory.length} selected)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onSelectAllChats && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAllChats(true)}
                  disabled={isLoadingChats || isLoadingSessionData}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAllChats(false)}
                  disabled={isLoadingChats || isLoadingSessionData}
                >
                  Deselect All
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleDataSourcesDetail('chats')}
            >
              {showDataSourcesDetails.chats ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {(isLoadingChats || isLoadingSessionData) ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading chat history...</span>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No chat history found for this session
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {chatHistory.length} chat conversations available
            </div>
            
            {showDataSourcesDetails.chats && (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedChatIds.includes(chat.id)}
                      onChange={(e) => onChatSelectionChange(chat.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {chat.user_message || chat.message}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(chat.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Compliance Gaps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Compliance Gaps</span>
            <span className="text-sm text-muted-foreground">
              ({selectedGapIds.length} of {complianceGaps.length} selected)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onSelectAllGaps && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAllGaps(true)}
                  disabled={isLoadingGaps || isLoadingSessionData}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAllGaps(false)}
                  disabled={isLoadingGaps || isLoadingSessionData}
                >
                  Deselect All
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleDataSourcesDetail('gaps')}
            >
              {showDataSourcesDetails.gaps ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {(isLoadingGaps || isLoadingSessionData) ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading compliance gaps...</span>
          </div>
        ) : complianceGaps.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No compliance gaps found for this session
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {complianceGaps.length} compliance gaps available
            </div>
            
            {showDataSourcesDetails.gaps && (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                {complianceGaps.map((gap) => (
                  <div key={gap.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedGapIds.includes(gap.id)}
                      onChange={(e) => onGapSelectionChange(gap.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {gap.gap_title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {gap.risk_level} risk • {gap.gap_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="font-medium">Documents</span>
            <span className="text-sm text-muted-foreground">
              ({selectedDocumentIds.length} of {documents.length} selected)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onSelectAllDocuments && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAllDocuments(true)}
                  disabled={isLoadingDocuments || isLoadingSessionData}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAllDocuments(false)}
                  disabled={isLoadingDocuments || isLoadingSessionData}
                >
                  Deselect All
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleDataSourcesDetail('documents')}
            >
              {showDataSourcesDetails.documents ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {(isLoadingDocuments || isLoadingSessionData) ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No documents found for this session
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {documents.length} documents available
            </div>
            
            {showDataSourcesDetails.documents && (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedDocumentIds.includes(doc.id)}
                      onChange={(e) => onDocumentSelectionChange(doc.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.filename}
                      </div>
                      <div className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                        {doc.file_size && ` | Size: ${(doc.file_size / 1024 / 1024).toFixed(2)} MB`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}