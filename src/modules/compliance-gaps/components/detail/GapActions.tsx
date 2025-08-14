import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Download, Edit, Eye, Share, UserCheck } from 'lucide-react'

interface GapActionsProps {
  gapId: string
  onShowStatusUpdate: () => void
  onShowAssignForm: () => void
  onMarkReviewed: () => void
}

export default function GapActions({ gapId, onShowStatusUpdate, onShowAssignForm, onMarkReviewed }: GapActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gap Actions</CardTitle>
        <CardDescription>Manage compliance gap status, assignments, and reporting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" className="flex items-center space-x-2" asChild>
            <Link to={`/compliance-gaps/${gapId}/edit`}>
              <Edit className="h-4 w-4" />
              <span>Edit Gap</span>
            </Link>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2" onClick={onShowStatusUpdate}>
            <Activity className="h-4 w-4" />
            <span>Update Status</span>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2" onClick={onShowAssignForm}>
            <UserCheck className="h-4 w-4" />
            <span>Assign to User</span>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2" onClick={onMarkReviewed}>
            <Eye className="h-4 w-4" />
            <span>Mark as Reviewed</span>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2">
            <Share className="h-4 w-4" />
            <span>Share Gap</span>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

