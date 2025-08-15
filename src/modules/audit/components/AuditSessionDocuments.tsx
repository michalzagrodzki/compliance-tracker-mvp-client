/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
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
  RefreshCw,
  Check
} from 'lucide-react'
import { useAuditSession } from '../hooks/useAuditSession'
import { auditSessionService } from '../services/auditSessionService'
import { useAuditSessionStore } from '../store/auditSessionStore'
import AddDocumentModal from './AddDocumentModal'
import { formatDate } from '@/lib/compliance'

interface AuditSessionDocumentsProps {
  sessionId: string
}

export default function AuditSessionDocuments({ sessionId }: AuditSessionDocumentsProps) {
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const { 
    sessionDocuments, 
    isRemovingDocument, 
    removeDocumentFromSession,
    clearError 
  } = useAuditSession()
  const { setSessionDocuments } = useAuditSessionStore()
  
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      setLocalLoading(true)
      setLocalError(null)
      setCurrentSessionId(sessionId)
      

      auditSessionService.getSessionDocuments(sessionId)
        .then((docs) => {
          setSessionDocuments(docs)
        })
        .catch((error: any) => {
          const errorMessage = error.message || 'Failed to load documents'
          setLocalError(errorMessage)
        })
        .finally(() => {
          setLocalLoading(false)
        })
    }
  }, [sessionId])

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await removeDocumentFromSession(sessionId, documentId)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to remove document'
      setLocalError(errorMessage)
    }
  }

  const handleDocumentAdded = () => {
    setLocalLoading(true)
    setLocalError(null)
    auditSessionService.getSessionDocuments(sessionId)
      .then((docs) => setSessionDocuments(docs))
      .catch((error: any) => {
        const errorMessage = error.message || 'Failed to refresh documents'
        setLocalError(errorMessage)
      })
      .finally(() => {
        setLocalLoading(false)
      })
  }

  const handleRefresh = () => {
    setLocalLoading(true)
    setLocalError(null)
    auditSessionService.getSessionDocuments(sessionId)
      .then((docs) => setSessionDocuments(docs))
      .catch((error: any) => {
        const errorMessage = error.message || 'Failed to refresh documents'
        setLocalError(errorMessage)
      })
      .finally(() => {
        setLocalLoading(false)
      })
  }


  const getDocumentStatus = (tags: string[]) => {
    if (!tags || tags.length === 0) return null
    
    const lowerCaseTags = tags.map(tag => tag.toLowerCase())
    
    if (lowerCaseTags.includes('current')) {
      return {
        label: 'Document is in use',
        icon: Check,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        iconColor: 'text-green-600'
      }
    }
    return null
  }

  const getDocumentType = (tags: string[]) => {
    if (!tags || tags.length === 0) return 'other'
    
    const lowerCaseTags = tags.map(tag => tag.toLowerCase())
    
    if (lowerCaseTags.includes('reference_document')) return 'reference'
    if (lowerCaseTags.includes('implementation_document')) return 'implementation'
    if (lowerCaseTags.includes('assessment_document')) return 'assessment'
    
    return 'other'
  }

  const groupDocuments = (documents: any[]) => {
    const groups = {
      reference: [] as any[],
      implementation: [] as any[],
      assessment: [] as any[],
      other: [] as any[]
    }

    documents.forEach(doc => {
      const type = getDocumentType(doc.document_tags)
      groups[type].push(doc)
    })

    return groups
  }

  const getGroupTitle = (groupType: string) => {
    switch (groupType) {
      case 'reference':
        return 'Reference Documents'
      case 'implementation':
        return 'Implementation Documents'
      case 'assessment':
        return 'Assessment Documents'
      default:
        return 'Documents'
    }
  }

  const getGroupIcon = (groupType: string) => {
    switch (groupType) {
      case 'reference':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'implementation':
        return <Shield className="h-4 w-4 text-green-600" />
      case 'assessment':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  // Using shared formatDate from lib/compliance

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
          <div className="space-y-8">
            {(() => {
              const groupedDocuments = groupDocuments(sessionDocuments)
              
              return Object.entries(groupedDocuments).map(([groupType, documents]) => {
                if (documents.length === 0) return null
                
                return (
                  <div key={groupType} className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-border">
                      {getGroupIcon(groupType)}
                      <h3 className="text-lg font-semibold text-foreground">
                        {getGroupTitle(groupType)}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        ({documents.length})
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {documents.map((document: any) => {
                        const documentStatus = getDocumentStatus(document.document_tags)
                        
                        return (
                          <Card key={document.id} className="hover:shadow-md transition-shadow relative">
                            {documentStatus && (
                              <div className={`absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${documentStatus.bgColor} ${documentStatus.textColor}`}>
                                <documentStatus.icon className={`h-3 w-3 ${documentStatus.iconColor}`} />
                                <span>{documentStatus.label}</span>
                              </div>
                            )}
                            
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">
                                  {getDocumentIcon(document.filename || '')}
                                </div>

                                <div className="flex-1 space-y-3 pr-24">
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
                        )
                      })}
                    </div>
                  </div>
                )
              }).filter(Boolean)
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
