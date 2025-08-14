import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Users, Calendar as CalendarIcon } from 'lucide-react'
import { formatDate } from '@/lib/compliance'

interface AssignmentSummaryProps {
  assigned_to?: string | null
  due_date?: string | null
}

export default function AssignmentSummary({ assigned_to, due_date }: AssignmentSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assigned_to ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Assigned to</span>
            </div>
            <p className="text-sm">{assigned_to}</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Not assigned</p>
          </div>
        )}

        {due_date && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <p className="text-sm">{formatDate(due_date)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

