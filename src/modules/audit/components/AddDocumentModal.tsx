/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, FileText, User, Tag, Shield, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { useIngestion } from '../../documents/hooks/useIngestion'
import { formatDate, getProcessingStatusColor } from '@/lib/documents'
import { useAuditSessionStore } from '../store/auditSessionStore'
import type { PdfIngestion } from '../../documents/types'

interface AddDocumentModalProps {
  sessionId: string
  onDocumentAdded?: () => void
}

export default function AddDocumentModal({ sessionId, onDocumentAdded }: AddDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    ingestions,
    isLoading: isLoadingIngestions,
    error: ingestionError,
    fetchIngestions,
    filterIngestions,
    clearError: clearIngestionError
  } = useIngestion()

  const {
    isAddingDocument,
    error: sessionError,
    addDocumentToSession,
    clearError: clearSessionError
  } = useAuditSessionStore()

  const filteredDocuments = filterIngestions(searchTerm)
  const error = ingestionError || sessionError

  useEffect(() => {
    if (isOpen && ingestions.length === 0) {
      fetchIngestions({ limit: 50, processing_status: 'completed' })
    }
  }, [isOpen, ingestions.length, fetchIngestions])

  const handleAddDocument = async (documentId: string) => {
    setSelectedDocument(documentId)
    clearIngestionError()
    clearSessionError()
    setSuccessMessage('')
    
    try {
      await addDocumentToSession(sessionId, documentId)
      
      setSuccessMessage('Document added successfully!')

      if (onDocumentAdded) {
        onDocumentAdded()
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsOpen(false)
        setSuccessMessage('')
        setSelectedDocument(null)
      }, 1500)
      
    } catch (err) {
      setSelectedDocument(null)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Add Document to Audit Session</span>
          </DialogTitle>
          <DialogDescription>
            Select a document to add to this audit session for compliance tracking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by name, author, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center space-x-2 p-3 text-sm text-green-700 bg-green-50 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto space-y-3">
            {isLoadingIngestions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No documents found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No processed documents available'}
                </p>
              </div>
            ) : (
              filteredDocuments.map((document: PdfIngestion) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {document.document_title || document.filename}
                          </h4>
                          {document.document_title && (
                            <p className="text-sm text-muted-foreground font-mono">
                              {document.filename}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                              <span>v{document.document_version}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Added {formatDate(document.ingested_at)}</span>
                          </div>
                        </div>

                        {document.document_tags && document.document_tags.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {document.document_tags.map((tag, index) => (
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

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getProcessingStatusColor(document.processing_status || 'unknown')}`}
                          >
                            {document.processing_status || 'unknown'}
                          </span>
                          {document.total_chunks && (
                            <span className="text-xs text-muted-foreground">
                              {document.total_chunks} chunks
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleAddDocument(document.id)}
                          disabled={isAddingDocument || selectedDocument === document.id}
                          className="min-w-[80px]"
                        >
                          {selectedDocument === document.id ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isAddingDocument ? (
                            'Adding...'
                          ) : (
                            'Add'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}