import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatFileSize } from '@/lib/documents'
import ProcessingStatusBadge from './ProcessingStatusBadge'
import DomainBadge from './DomainBadge'
import DocumentTagList from './DocumentTagList'
import { 
  FileText,
  Calendar,
  Download,
  Shield,
  User,
  AlertCircle,
  UserPen,
  BookOpen
} from 'lucide-react'
import type { PdfIngestion } from '../../types'

interface DocumentListItemProps {
  ingestion: PdfIngestion
}

export default function DocumentListItem({ ingestion }: DocumentListItemProps) {
  return (
    <Card key={ingestion.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">
                <Link 
                  to={`/documents/${ingestion.id}`}
                  className="hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>{ingestion.filename}</span>
                </Link>
              </CardTitle>
              <DomainBadge domain={ingestion.compliance_domain} />
              <ProcessingStatusBadge status={ingestion.processing_status} />
            </div>

            {ingestion.metadata?.author && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <UserPen className="h-4 w-4" />
                <span>Author: {ingestion.metadata.author}</span>
              </div>
            )}
            
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

              {ingestion.metadata?.pages && (
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{ingestion.metadata.pages} pages</span>
                </div>
              )}
            </div>

            {ingestion.document_tags && ingestion.document_tags.length > 0 && (
              <DocumentTagList tags={ingestion.document_tags} maxVisible={5} />
            )}

            {ingestion.document_version && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Version: {ingestion.document_version}</span>
              </div>
            )}
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
            <Link to={`/documents/${ingestion.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}