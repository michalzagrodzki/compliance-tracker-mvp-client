import { useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loading from '@/components/Loading'
import { useIngestion } from '../hooks/useIngestion'
import { formatDateDetailed, formatFileSize, getDomainColor } from '@/lib/documents'
import { getProcessingStatusInfo } from './shared/ProcessingStatusBadge'
import DocumentTagList from './shared/DocumentTagList'
import ErrorDisplay from './shared/ErrorDisplay'
import EmptyState from './shared/EmptyState'
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Shield,
  User,
  Download,
  AlertCircle,
  Database,
  Hash,
  Activity,
  Search,
  FileEdit,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function DocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>()
  const {
    currentIngestion,
    isLoading,
    error,
    fetchIngestionById,
    clearError
  } = useIngestion()

  useEffect(() => {
    if (documentId) {
      clearError()
      fetchIngestionById(documentId).catch((err) => {
        console.error('Error fetching ingestion:', err)
      })
    } else {
      console.warn('No ID provided to DocumentDetail component')
    }
  }, [documentId, fetchIngestionById, clearError])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/documents" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Documents</span>
            </Link>
          </Button>
        </div>
        <ErrorDisplay error={error} />
      </div>
    )
  }

  if (!currentIngestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/documents" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Documents</span>
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Document not found"
          description="The document you're looking for doesn't exist."
          showAction={false}
        />
      </div>
    )
  }

  const statusInfo = getProcessingStatusInfo(currentIngestion.processing_status)
  const StatusIcon = statusInfo.icon
  const domainColor = getDomainColor(currentIngestion.compliance_domain)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/documents" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Documents</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>{currentIngestion.document_title || currentIngestion.filename}</span>
            </h1>
            <p className="text-muted-foreground">Document Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusInfo.className}`}>
            <StatusIcon className="h-3 w-3 inline mr-1" />
            {statusInfo.text}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Document Title</h4>
                  <div className="flex items-center space-x-2">
                    <FileEdit className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{currentIngestion.document_title || 'No title provided'}</p>
                  </div>
                  {currentIngestion.document_title && currentIngestion.document_title !== currentIngestion.filename && (
                    <p className="text-xs text-muted-foreground">
                      Filename: {currentIngestion.filename}
                    </p>
                  )}
                </div>

                {currentIngestion.document_author && (
                  <div className="space-y-2 md:col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Document Author</h4>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{currentIngestion.document_author}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">File Name</h4>
                  <p className="font-medium break-all">{currentIngestion.filename}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">File Type</h4>
                  <p>PDF</p>
                </div>

                {currentIngestion.file_size && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">File Size</h4>
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>{formatFileSize(currentIngestion.file_size)}</span>
                    </div>
                  </div>
                )}

                {currentIngestion.total_chunks !== undefined && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Total Chunks</h4>
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span>{currentIngestion.total_chunks} text chunks</span>
                    </div>
                  </div>
                )}

                {currentIngestion.compliance_domain && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Compliance Domain</h4>
                    <span className={`inline-flex px-2 py-1 text-sm font-medium rounded border ${domainColor}`}>
                      {currentIngestion.compliance_domain}
                    </span>
                  </div>
                )}

                {currentIngestion.document_version && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Version</h4>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>{currentIngestion.document_version}</span>
                    </div>
                  </div>
                )}
              </div>

              {currentIngestion.document_tags && currentIngestion.document_tags.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground">Document Tags</h4>
                  <DocumentTagList 
                    tags={currentIngestion.document_tags} 
                    maxVisible={20}
                    className="items-start"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Processing Status</span>
              </CardTitle>
              <CardDescription>
                Current status and details of the ingestion process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <StatusIcon className={`h-6 w-6 ${statusInfo.className.split(' ')[0]}`} />
                <div>
                  <p className="font-medium">{statusInfo.text}</p>
                  <p className="text-sm text-muted-foreground">
                    Processing Status
                  </p>
                </div>
              </div>

              {currentIngestion.error_message && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex items-start space-x-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Processing Error</p>
                      <p className="text-sm text-red-700 mt-1">{currentIngestion.error_message}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentIngestion.processing_status === 'processing' && (
                <div className="p-3 border border-blue-200 bg-blue-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-600 animate-spin" />
                    <p className="text-sm text-blue-700">
                      Document is currently being processed...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {currentIngestion.processing_status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/documents/search?source=${encodeURIComponent(currentIngestion.filename)}`}>
                    <Search className="h-4 w-4 mr-2" />
                    Search Document Chunks
                  </Link>
                </Button>
                
                {currentIngestion.compliance_domain && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/chat?domain=${currentIngestion.compliance_domain}`}>
                      <Hash className="h-4 w-4 mr-2" />
                      Query in Domain
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Uploaded</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDateDetailed(currentIngestion.ingested_at)}
                  </span>
                </div>
              </div>

              {currentIngestion.uploaded_by && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Uploaded By</h4>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{currentIngestion.uploaded_by}</span>
                  </div>
                </div>
              )}

              {currentIngestion.processing_completed_at && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Processing Completed</h4>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDateDetailed(currentIngestion.processing_completed_at)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {currentIngestion.updated_at ? formatDateDetailed(currentIngestion.updated_at) : 'Not available'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Ingestion ID</h4>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {currentIngestion.id}
                </p>
              </div>

              {currentIngestion.total_chunks !== undefined && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Chunks Created</h4>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentIngestion.total_chunks} text chunks</span>
                  </div>
                </div>
              )}

              {currentIngestion.file_hash && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">File Hash (SHA-256)</h4>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {currentIngestion.file_hash}
                  </p>
                </div>
              )}

              {currentIngestion.original_path && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Original Path</h4>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {currentIngestion.original_path}
                  </p>
                </div>
              )}

              {currentIngestion.processing_duration_seconds && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Processing Duration</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentIngestion.processing_duration_seconds} seconds</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {currentIngestion.created_at ? formatDateDetailed(currentIngestion.created_at) : formatDateDetailed(currentIngestion.ingested_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}