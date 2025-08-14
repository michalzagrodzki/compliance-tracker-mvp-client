import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, FileSearch, FileText } from 'lucide-react'

interface RelatedDocumentsProps {
  documents?: string[] | null
}

export default function RelatedDocuments({ documents }: RelatedDocumentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Related Documents</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents && documents.length > 0 ? (
            documents.map((doc, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded">
                <FileSearch className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{doc}</span>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <FileSearch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No related documents</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

