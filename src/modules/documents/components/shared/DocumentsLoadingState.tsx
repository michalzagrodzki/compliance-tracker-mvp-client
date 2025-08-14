import { Link } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'

export default function DocumentsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor uploaded PDF documents in the knowledge base
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
        <CardContent className="py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <FileText className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Loading Documents</h3>
              <p className="text-muted-foreground max-w-md">
                Fetching your document library from the knowledge base...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}