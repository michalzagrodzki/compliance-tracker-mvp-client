import { useEffect, type Key } from 'react'
import { useParams, Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useIngestionStore } from '../store/documentStore'
import Loading from '@/components/Loading'
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  Shield,
  User,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Database,
  Hash,
  Activity,
  Search,
  FileEdit,
  UserCheck
} from 'lucide-react'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

const getProcessingStatusInfo = (status?: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle,
        text: 'Completed',
        className: 'text-green-600 bg-green-50 border-green-200'
      }
    case 'processing':
      return {
        icon: Activity,
        text: 'Processing',
        className: 'text-blue-600 bg-blue-50 border-blue-200'
      }
    case 'failed':
      return {
        icon: XCircle,
        text: 'Failed',
        className: 'text-red-600 bg-red-50 border-red-200'
      }
    default:
      return {
        icon: FileText,
        text: 'Unknown',
        className: 'text-gray-600 bg-gray-50 border-gray-200'
      }
  }
}

const DOMAIN_COLORS = {
  'ISO27001': 'bg-green-100 text-green-700 border-green-200',
  'DEFAULT': 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function IngestionDetail() {
  const { documentId } = useParams<{ documentId: string }>()
  const {
    currentIngestion,
    isLoading,
    error,
    fetchIngestionById,
    clearError
  } = useIngestionStore()

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
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{error}</span>
          </CardContent>
        </Card>
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
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Document not found</h3>
            <p className="text-muted-foreground">The document you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getProcessingStatusInfo(currentIngestion.processing_status)
  const StatusIcon = statusInfo.icon
  const domainColor = DOMAIN_COLORS[currentIngestion.compliance_domain as keyof typeof DOMAIN_COLORS] || DOMAIN_COLORS.DEFAULT

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
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {currentIngestion.document_tags.map((tag: string, index: Key | null | undefined) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded border"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
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
                    {formatDate(currentIngestion.ingested_at)}
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
                      {formatDate(currentIngestion.processing_completed_at)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {currentIngestion.updated_at ? formatDate(currentIngestion.updated_at) : 'Not available'}
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
                  {currentIngestion.created_at ? formatDate(currentIngestion.created_at) : formatDate(currentIngestion.ingested_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  )
}