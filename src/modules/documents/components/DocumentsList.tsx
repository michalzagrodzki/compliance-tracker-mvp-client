/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/documents/components/IngestionsList.tsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIngestionStore } from '../store/documentStore'
import Loading from '@/components/Loading'
import { 
  Plus, 
  Search,
  FileText,
  Calendar,
  Tag,
  Shield,
  AlertCircle,
  Filter,
  Download,
  User,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

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
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

const getProcessingStatusColor = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'failed':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getProcessingStatusIcon = (status?: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle
    case 'processing':
      return Clock
    case 'failed':
      return XCircle
    default:
      return FileText
  }
}

const DOMAIN_COLORS = {
  'ISO27001': 'bg-green-100 text-green-700 border-green-200',
  'GDPR': 'bg-blue-100 text-blue-700 border-blue-200',
  'SOX': 'bg-purple-100 text-purple-700 border-purple-200',
  'HIPAA': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'PCI_DSS': 'bg-orange-100 text-orange-700 border-orange-200',
  'DEFAULT': 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function IngestionsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const {
    ingestions,
    complianceDomains,
    isLoading,
    error,
    fetchIngestions,
    fetchComplianceDomains,
    searchIngestions
  } = useIngestionStore()

  useEffect(() => {
    fetchIngestions({ limit: 20 })
    fetchComplianceDomains()
  }, [fetchIngestions, fetchComplianceDomains])

  const handleSearch = () => {
    const searchParams: any = { limit: 20 }
    
    if (searchTerm.trim()) {
      searchParams.filename_search = searchTerm.trim()
    }
    
    if (selectedDomain) {
      searchParams.compliance_domain = selectedDomain
    }

    if (selectedStatus) {
      searchParams.processing_status = selectedStatus
    }
    
    searchIngestions(searchParams)
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedDomain('')
    setSelectedStatus('')
    fetchIngestions({ limit: 20 })
  }

  if (isLoading && ingestions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Ingestions</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor PDF document ingestions into the knowledge base
          </p>
        </div>
        <Button asChild>
          <Link to="/documents/upload" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ingestions by filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compliance Domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All domains</option>
                    {complianceDomains.map((domain) => (
                      <option key={domain.code} value={domain.code}>
                        {domain.code} - {domain.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Processing Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All statuses</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex space-x-2">
                  <Button onClick={handleSearch} size="sm">
                    Apply Filters
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{error}</span>
          </CardContent>
        </Card>
      )}

      {ingestions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No ingestions found</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || selectedDomain || selectedStatus
                  ? 'Try adjusting your search criteria'
                  : 'Upload your first document to get started'
                }
              </p>
            </div>
            <Button asChild>
              <Link to="/documents/upload" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Upload Document</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ingestions.map((ingestion) => {
            const domainColor = DOMAIN_COLORS[ingestion.compliance_domain as keyof typeof DOMAIN_COLORS] || DOMAIN_COLORS.DEFAULT
            const statusColor = getProcessingStatusColor(ingestion.processing_status)
            const StatusIcon = getProcessingStatusIcon(ingestion.processing_status)

            return (
              <Card key={ingestion.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">
                          <Link 
                            to={`/ingestions/${ingestion.id}`}
                            className="hover:text-primary transition-colors flex items-center space-x-2"
                          >
                            <FileText className="h-5 w-5" />
                            <span>{ingestion.filename}</span>
                          </Link>
                        </CardTitle>
                        {ingestion.compliance_domain && (
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${domainColor}`}>
                            {ingestion.compliance_domain}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColor} flex items-center space-x-1`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{ingestion.processing_status || 'unknown'}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Uploaded: {formatDate(ingestion.ingested_at)}
                          </span>
                        </div>
                        
                        {ingestion.file_size && (
                          <div className="flex items-center space-x-1">
                            <Download className="h-4 w-4" />
                            <span>{formatFileSize(ingestion.file_size)}</span>
                          </div>
                        )}
                        
                        {ingestion.total_chunks && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{ingestion.total_chunks} chunks</span>
                          </div>
                        )}
                      </div>

                      {ingestion.document_tags && ingestion.document_tags.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {ingestion.document_tags.slice(0, 5).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                              >
                                {tag.replace('_', ' ')}
                              </span>
                            ))}
                            {ingestion.document_tags.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{ingestion.document_tags.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {ingestion.document_version && (
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4" />
                            <span>Version: {ingestion.document_version}</span>
                          </div>
                        )}
                        
                        {ingestion.uploaded_by && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>By: {ingestion.uploaded_by}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {ingestion.error_message && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Error: {ingestion.error_message}</span>
                        </div>
                      )}
                      {!ingestion.error_message && ingestion.processing_status === 'completed' && (
                        <span className="text-green-600">
                          Processing completed successfully
                        </span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/ingestions/${ingestion.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isLoading && ingestions.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      )}
    </div>
  )
}