/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/shared/PageHeader'
import { useIngestion } from '../hooks/useIngestion'
import EmptyState from './shared/EmptyState'
import ErrorDisplay from './shared/ErrorDisplay'
import DocumentSearchFilters from './shared/DocumentSearchFilters'
import DocumentsLoadingState from './shared/DocumentsLoadingState'
import DocumentListItem from './shared/DocumentListItem'
import { Plus, FileText } from 'lucide-react'

export default function DocumentsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  
  const {
    ingestions,
    complianceDomains,
    isLoading,
    error,
    fetchIngestions,
    fetchComplianceDomains,
    searchIngestions
  } = useIngestion()

  useEffect(() => {
    fetchIngestions({ limit: 20 })
    fetchComplianceDomains()
  }, [fetchIngestions, fetchComplianceDomains])

  const handleSearch = () => {
    const searchParams: Record<string, any> = { limit: 20 }
    
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
    return <DocumentsLoadingState />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage and monitor uploaded PDF documents in the knowledge base"
        actionButton={{
          href: "/documents/upload",
          icon: <Plus className="h-4 w-4" />,
          text: "Upload Document",
          asChild: true
        }}
      />

      <Card>
        <CardContent className="pt-6">
          <DocumentSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDomain={selectedDomain}
            setSelectedDomain={setSelectedDomain}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            complianceDomains={complianceDomains}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {error && <ErrorDisplay error={error} />}

      {ingestions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={
            searchTerm || selectedDomain || selectedStatus
              ? 'Try adjusting your search criteria'
              : 'Upload your first document to get started'
          }
        />
      ) : (
        <div className="grid gap-4">
          {ingestions.map((ingestion) => (
            <DocumentListItem key={ingestion.id} ingestion={ingestion} />
          ))}
        </div>
      )}

      {isLoading && ingestions.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">Loading more documents...</span>
          </div>
        </div>
      )}
    </div>
  )
}