/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  User, 
  Tag, 
  Shield, 
  Calendar, 
  AlertCircle, 
  Download,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useAuditSessionStore, auditSessionStoreUtils } from '../store/auditSessionStore'
import { auditSessionService } from '../services/auditSessionService'
import AddDocumentModal from './AddDocumentModal'

interface AuditSessionDocumentsProps {
  sessionId: string
}

export default function AuditSessionDocuments({ sessionId }: AuditSessionDocumentsProps) {
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const sessionDocuments = useAuditSessionStore(state => state.sessionDocuments)
  const isRemovingDocument = useAuditSessionStore(state => state.isRemovingDocument)
  
  const loadDocuments = useCallback(async (sessionIdToLoad: string, force = false) => {
    if (!force && hasInitialLoad && currentSessionId === sessionIdToLoad) {
      return
    }

    setLocalLoading(true)
    setLocalError(null)

    try {
      const documents = await auditSessionService.getSessionDocuments(sessionIdToLoad)
      
      auditSessionStoreUtils.setState({ 
        sessionDocuments: documents,
        error: null 
      })

      setCurrentSessionId(sessionIdToLoad)
      setHasInitialLoad(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load documents'
      setLocalError(errorMessage)
      
      // Clear documents on error
      auditSessionStoreUtils.setState({ 
        sessionDocuments: [],
        error: errorMessage 
      })
    } finally {
      setLocalLoading(false)
    }
  }, [hasInitialLoad, currentSessionId])

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      loadDocuments(sessionId)
    }
  }, [sessionId, currentSessionId, loadDocuments])

  const handleRemoveDocument = useCallback(async (documentId: string) => {
    try {
      await auditSessionService.removeDocumentFromSession(sessionId, documentId)
      
      const currentDocs = auditSessionStoreUtils.getState().sessionDocuments
      const updatedDocs = currentDocs.filter((doc: any) => doc.id !== documentId)
      
      auditSessionStoreUtils.setState({
        sessionDocuments: updatedDocs,
        isRemovingDocument: null,
        error: null
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to remove document'
      setLocalError(errorMessage)
      auditSessionStoreUtils.setState({
        isRemovingDocument: null,
        error: errorMessage
      })
    }
  }, [sessionId])

  const handleDocumentAdded = useCallback(() => {
    loadDocuments(sessionId, true)
  }, [sessionId, loadDocuments])

  const handleRefresh = useCallback(() => {
    loadDocuments(sessionId, true)
  }, [sessionId, loadDocuments])

  const clearError = useCallback(() => {
    setLocalError(null)
    auditSessionStoreUtils.setState({ error: null })
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getDocumentIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  if (localLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Session Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  console.log(sessionDocuments)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Session Documents</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({sessionDocuments.length})
              </span>
            </CardTitle>
            <CardDescription>
              Documents associated with this audit session for compliance review
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={localLoading}
            >
              <RefreshCw className={`h-4 w-4 ${localLoading ? 'animate-spin' : ''}`} />
            </Button>
            <AddDocumentModal 
              sessionId={sessionId} 
              onDocumentAdded={handleDocumentAdded}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {localError && (
          <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{localError}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {sessionDocuments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No documents added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add documents to this audit session to track compliance evidence
            </p>
            <AddDocumentModal 
              sessionId={sessionId} 
              onDocumentAdded={handleDocumentAdded}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {sessionDocuments.map((document: any) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getDocumentIcon(document.filename || '')}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          {document.document_title || document.source_filename || document.filename}
                        </h4>
                        {document.document_title && (
                          <p className="text-sm text-muted-foreground font-mono">
                            {document.source_filename || document.filename}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {document.document_author && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{document.document_author}</span>
                          </div>
                        )}
                        
                        {document.compliance_domain && (
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>{document.compliance_domain}</span>
                          </div>
                        )}

                        {document.document_version && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Version {document.document_version}</span>
                          </div>
                        )}

                        {document.ingested_at && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Ingested {formatDate(document.ingested_at)}</span>
                          </div>
                        )}

                        {document.total_chunks && (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{document.total_chunks} chunks</span>
                          </div>
                        )}
                      </div>

                      {document.document_tags && document.document_tags.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {document.document_tags.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {document.file_size_bytes && (
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(document.file_size_bytes)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="h-8">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveDocument(document.id)}
                            disabled={isRemovingDocument === document.id}
                          >
                            {isRemovingDocument === document.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-destructive" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {document.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          <strong>Notes:</strong> {document.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}